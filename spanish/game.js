// ¡Che, Verbo! — game logic. Data comes from data.js (VERBS, FORMS, SCENES, RULES, SE_ITEMS, TH_ITEMS).
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var ROUND_SIZE = 12;
  var CLOCK_START = 60;
  var MAX_RETRIES = 2;
  var STORE_KEY = 'cheverbo.v1';

  // ---------- Data prep ----------
  var FORM_INFO = {};
  Object.keys(FORMS).forEach(function (t) {
    Object.keys(FORMS[t]).forEach(function (p) {
      FORMS[t][p].forEach(function (f, i) {
        if (f && !FORM_INFO[f]) FORM_INFO[f] = { verb: VERBS[i], t: t, p: p };
      });
    });
  });

  var PAIRS = { se: ['ser', 'estar'], th: ['tener', 'hacer'] };

  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  var ITEMS = [];
  function addItems(list, pair) {
    list.forEach(function (row) {
      var info = FORM_INFO[row[3]];
      if (!info) { console.warn('Unknown form', row); return; }
      var other = PAIRS[pair][0] === info.verb ? PAIRS[pair][1] : PAIRS[pair][0];
      ITEMS.push({
        id: hash(row[2]), scene: row[0], rule: row[1], s: row[2], a: row[3], en: row[4], note: row[5] || '',
        verb: info.verb, pair: pair,
        forms: {}, other: other
      });
      var it = ITEMS[ITEMS.length - 1];
      it.forms[info.verb] = row[3];
      it.forms[other] = FORMS[info.t][info.p][VERBS.indexOf(other)] || other;
    });
  }
  addItems(SE_ITEMS, 'se');
  addItems(TH_ITEMS, 'th');
  var BY_ID = {};
  ITEMS.forEach(function (it) { BY_ID[it.id] = it; });

  // ---------- Storage ----------
  var store = { items: {}, rules: {}, best: {}, settings: {} };
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      store.items = parsed.items || {};
      store.rules = parsed.rules || {};
      store.best = parsed.best || {};
      store.settings = parsed.settings || {};
    }
  } catch (e) { /* storage unavailable: play without memory */ }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }

  var settings = Object.assign({ game: 'se', mode: 'tranqui', level: 'facil', scene: 'all', sound: true }, store.settings);

  // ---------- Mastery ----------
  function ruleStats(rule) {
    var h = store.rules[rule] || [];
    var ok = h.reduce(function (a, b) { return a + b; }, 0);
    var pct = h.length ? ok / h.length : 0;
    var level;
    if (!h.length) level = 0;
    else if (h.length >= 5 && pct >= 0.85) level = 3;
    else if (pct >= 0.6) level = 2;
    else level = 1;
    return { n: h.length, pct: pct, level: level };
  }
  var LEVEL_NAMES = ['Sin jugar', 'A practicar', 'Casi', 'Dominada ✓'];

  function record(item, correct) {
    var h = store.rules[item.rule] || (store.rules[item.rule] = []);
    h.push(correct ? 1 : 0);
    if (h.length > 10) h.shift();
    var st = store.items[item.id] || (store.items[item.id] = { b: 0, seen: 0 });
    st.seen++;
    st.b = correct ? Math.min(st.b + 1, 4) : 0;
    save();
  }

  function weakRules() {
    return Object.keys(RULES).filter(function (r) {
      var s = ruleStats(r);
      return s.n >= 3 && s.level < 3;
    }).sort(function (a, b) { return ruleStats(a).pct - ruleStats(b).pct; });
  }

  // ---------- Selection ----------
  function weight(it) {
    var st = store.items[it.id];
    if (!st) return 3;             // never seen
    if (st.b === 0) return 6;      // missed last time
    return [6, 2, 1.2, 0.7, 0.4][st.b];
  }
  function pickWeighted(pool, n) {
    var bag = pool.slice(), out = [];
    while (out.length < n && bag.length) {
      var total = bag.reduce(function (a, it) { return a + weight(it); }, 0);
      var r = Math.random() * total, i = 0;
      for (; i < bag.length - 1; i++) { r -= weight(bag[i]); if (r <= 0) break; }
      out.push(bag.splice(i, 1)[0]);
    }
    return out;
  }
  function currentPool() {
    return ITEMS.filter(function (it) {
      return (settings.game === 'mix' || it.pair === settings.game) &&
        (settings.scene === 'all' || it.scene === settings.scene);
    });
  }

  // ---------- Screens ----------
  var SCREENS = ['home', 'play', 'end', 'guide', 'progress'];
  function show(name) {
    SCREENS.forEach(function (s) { $(s).hidden = s !== name; });
    window.scrollTo(0, 0);
  }

  // ---------- Sound ----------
  var actx = null;
  function tone(freqs, dur, type) {
    if (!settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t = actx.currentTime;
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = type || 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * dur);
        g.gain.exponentialRampToValueAtTime(0.18, t + i * dur + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (i + 1) * dur + 0.08);
        o.connect(g).connect(actx.destination);
        o.start(t + i * dur);
        o.stop(t + (i + 1) * dur + 0.1);
      });
    } catch (e) { /* no audio */ }
  }
  var sfx = {
    ok: function () { tone([659, 988], 0.08); },
    bad: function () { tone([220, 185], 0.12, 'sine'); },
    streak: function () { tone([523, 659, 784, 1047], 0.07); },
    end: function () { tone([392, 523, 659, 784, 1047], 0.09); }
  };

  // ---------- Confetti ----------
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function confetti(count) {
    if (reduceMotion) return;
    var cv = $('fx'), ctx = cv.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    var cs = getComputedStyle(document.documentElement);
    var colors = ['--sol', '--ser', '--estar', '--tener', '--hacer', '--ok'].map(function (v) { return cs.getPropertyValue(v).trim(); });
    var parts = [];
    for (var i = 0; i < count; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
        c: colors[i % colors.length]
      });
    }
    var frames = 0;
    (function step() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(function (p) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (++frames < 110) requestAnimationFrame(step);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })();
  }

  function toast(text) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1600);
  }

  // ---------- Helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function atStart(item) {
    var pre = item.s.slice(0, item.s.indexOf('___')).trim();
    return pre === '' || /[¡¿—.!?]$/.test(pre);
  }
  function sentenceHTML(item, filled, pop) {
    var i = item.s.indexOf('___');
    var before = esc(item.s.slice(0, i)), after = esc(item.s.slice(i + 3));
    var mid;
    if (filled) {
      var word = atStart(item) ? cap(item.a) : item.a;
      mid = '<span class="fill v-' + item.verb + (pop ? ' pop' : '') + '">' + esc(word) + '</span>';
    } else {
      mid = '<span class="blank" aria-label="espacio en blanco"></span>';
    }
    return before + mid + after;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  var PRAISE = ['¡Bien ahí!', '¡Joya!', '¡Bárbaro!', '¡Genial, che!', '¡Qué crack!', '¡Eso!', '¡Impecable!', '¡De diez!', '¡Espectacular!', '¡Tal cual!'];
  var OOPS = ['¡Uy, casi!', 'Tranqui, ya sale', 'No pasa nada', 'Casi, casi', 'Ojo con esta'];
  var BACKSOON = 'Esta vuelve en un ratito para que la claves.';

  // ---------- Home ----------
  function renderHome() {
    var nSE = ITEMS.filter(function (i) { return i.pair === 'se'; }).length;
    var nTH = ITEMS.length - nSE;
    $('n-se').textContent = nSE + ' escenas';
    $('n-th').textContent = nTH + ' escenas';
    $('n-mix').textContent = ITEMS.length + ' escenas';
    var mastered = Object.keys(RULES).filter(function (r) { return ruleStats(r).level === 3; }).length;
    $('home-count').innerHTML = '<span>' + ITEMS.length + ' escenas</span><span>' + Object.keys(SCENES).length +
      ' lugares</span><span>' + mastered + ' / ' + Object.keys(RULES).length + ' reglas dominadas</span>';

    document.querySelectorAll('[data-game]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.game === settings.game); });
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mode === settings.mode); });
    document.querySelectorAll('[data-level]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.level === settings.level); });

    var counts = {};
    ITEMS.forEach(function (it) {
      if (settings.game === 'mix' || it.pair === settings.game) counts[it.scene] = (counts[it.scene] || 0) + 1;
    });
    if (settings.scene !== 'all' && !counts[settings.scene]) settings.scene = 'all';
    var total = Object.keys(counts).reduce(function (a, k) { return a + counts[k]; }, 0);
    var html = '<button class="chip" data-scene="all" aria-pressed="' + (settings.scene === 'all') + '">Todas<span class="n">' + total + '</span></button>';
    Object.keys(SCENES).forEach(function (k) {
      if (!counts[k]) return;
      html += '<button class="chip" data-scene="' + k + '" aria-pressed="' + (settings.scene === k) + '">' +
        SCENES[k].icon + ' ' + esc(SCENES[k].name) + '<span class="n">' + counts[k] + '</span></button>';
    });
    $('scenes').innerHTML = html;

    var weak = weakRules();
    if (weak.length) {
      $('weak').hidden = false;
      $('weak-text').innerHTML = 'Te conviene repasar: <b>' + weak.slice(0, 3).map(function (r) { return esc(RULES[r].name); }).join(', ') + '</b>.';
    } else {
      $('weak').hidden = true;
    }
    store.settings = settings;
    save();
  }

  $('games').addEventListener('click', function (e) {
    var b = e.target.closest('[data-game]'); if (!b) return;
    settings.game = b.dataset.game; renderHome();
  });
  $('modes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]'); if (!b) return;
    settings.mode = b.dataset.mode; renderHome();
  });
  $('levels').addEventListener('click', function (e) {
    var b = e.target.closest('[data-level]'); if (!b) return;
    settings.level = b.dataset.level; renderHome();
  });
  $('scenes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-scene]'); if (!b) return;
    settings.scene = b.dataset.scene; renderHome();
  });
  $('start').addEventListener('click', function () { startRound(); });
  $('weak-go').addEventListener('click', function () { startWeak(); });
  $('open-guide').addEventListener('click', function () { renderGuide(settings.game === 'th' ? 'th' : 'se'); show('guide'); });
  $('open-progress').addEventListener('click', function () { renderProgress(); show('progress'); });
  document.querySelectorAll('.back').forEach(function (b) {
    b.addEventListener('click', function () { renderHome(); show('home'); });
  });

  // ---------- Round ----------
  var R = null;

  function startRound(fixedItems, label) {
    var clock = settings.mode === 'reloj' && !fixedItems;
    var pool = fixedItems || currentPool();
    if (!pool.length) return;
    R = {
      clock: clock,
      pool: pool,
      queue: clock ? pickWeighted(pool, pool.length).map(function (it) { return { item: it }; })
                   : (fixedItems ? shuffle(fixedItems.slice()) : pickWeighted(pool, ROUND_SIZE)).map(function (it) { return { item: it }; }),
      pos: -1, score: 0, streak: 0, bestStreak: 0,
      first: 0, firstOk: 0, retries: {}, misses: [], ruleTally: {},
      time: CLOCK_START, paused: false, timer: null, answered: false, label: label || ''
    };
    $('meter').classList.toggle('timer', clock);
    if (clock) {
      var last = Date.now();
      R.timer = setInterval(function () {
        var now = Date.now(), dt = (now - last) / 1000; last = now;
        if (R.paused) return;
        R.time = Math.max(0, R.time - dt);
        updateMeter();
        if (R.time <= 0) endRound();
      }, 100);
    }
    show('play');
    nextCard();
  }

  function startWeak() {
    var weak = weakRules();
    var pool = ITEMS.filter(function (it) {
      var st = store.items[it.id];
      return weak.indexOf(it.rule) >= 0 || (st && st.b === 0);
    });
    if (!pool.length) return;
    startRound(pickWeighted(pool, ROUND_SIZE), 'repaso');
  }

  function updateMeter() {
    var pct;
    if (R.clock) {
      pct = Math.min(100, (R.time / CLOCK_START) * 100);
      $('meter').classList.toggle('low', R.time < 10);
    } else {
      pct = (Math.max(0, R.pos) / R.queue.length) * 100;
    }
    $('meter-fill').style.width = pct + '%';
  }
  function updateHUD() {
    $('score').textContent = R.score;
    $('streak').textContent = '🔥 ' + R.streak;
    $('streak').classList.toggle('hot', R.streak >= 3);
    updateMeter();
  }

  function nextCard() {
    R.pos++;
    if (R.clock && R.pos >= R.queue.length) {
      // Clock mode ran through the pool: reshuffle and keep going.
      R.queue = R.queue.concat(pickWeighted(R.pool, R.pool.length).map(function (it) { return { item: it }; }));
    }
    if (R.pos >= R.queue.length) return endRound();
    R.answered = false;
    R.hintUsed = false;
    R.paused = false;
    var entry = R.queue[R.pos], it = entry.item;
    var sc = SCENES[it.scene];
    $('scene').textContent = sc.icon + ' ' + sc.name + (entry.retry ? ' · otra vez' : '');
    $('sentence').innerHTML = sentenceHTML(it, false);
    $('english').textContent = it.en;
    $('english').hidden = true;
    $('hint').hidden = true;
    $('feedback').hidden = true;
    $('next').hidden = true;
    var pro = settings.level === 'pro';
    $('tools').hidden = pro;
    $('btn-hint').disabled = false;
    $('btn-en').disabled = false;

    var verbs = PAIRS[it.pair];
    $('choices').hidden = false;
    $('choices').innerHTML = verbs.map(function (v, i) {
      var label = pro ? it.forms[v] : v;
      return '<button class="choice v-' + v + '" data-verb="' + v + '"><span class="v' + (pro ? ' form' : '') + '">' +
        esc(label) + '</span><span class="k">' + (pro ? v + ' · ' : '') + (i === 0 ? '← o 1' : '2 o →') + '</span></button>';
    }).join('');
    updateHUD();
  }

  $('choices').addEventListener('click', function (e) {
    var b = e.target.closest('[data-verb]'); if (!b) return;
    answer(b.dataset.verb, b);
  });
  $('btn-hint').addEventListener('click', showHint);
  $('btn-en').addEventListener('click', showEnglish);
  $('next').addEventListener('click', function () { if (R && R.answered) nextCard(); });
  $('quit').addEventListener('click', function () {
    if (R && R.timer) clearInterval(R.timer);
    R = null; renderHome(); show('home');
  });

  function showHint() {
    if (!R || R.answered || settings.level === 'pro') return;
    var it = R.queue[R.pos].item;
    R.hintUsed = true;
    $('hint').textContent = '💡 ' + RULES[it.rule].hint;
    $('hint').hidden = false;
    $('btn-hint').disabled = true;
  }
  function showEnglish() {
    if (!R || R.answered || settings.level === 'pro') return;
    $('english').hidden = false;
    $('btn-en').disabled = true;
  }

  function answer(verb, btn) {
    if (!R || R.answered) return;
    R.answered = true;
    var entry = R.queue[R.pos], it = entry.item;
    var correct = verb === it.verb;
    var pro = settings.level === 'pro';

    if (!entry.retry) {
      R.first++;
      if (correct) R.firstOk++;
      record(it, correct);
      var t = R.ruleTally[it.rule] || (R.ruleTally[it.rule] = { ok: 0, n: 0 });
      t.n++; if (correct) t.ok++;
    }

    var gained = 0;
    if (correct) {
      R.streak++;
      R.bestStreak = Math.max(R.bestStreak, R.streak);
      var mult = Math.min(5, 1 + Math.floor(R.streak / 3));
      gained = Math.round(100 * mult * (pro ? 2 : 1) * (R.hintUsed ? 0.5 : 1) * (entry.retry ? 0.5 : 1));
      R.score += gained;
      if (R.clock) R.time = Math.min(CLOCK_START, R.time + 1);
      if (R.streak === 5 || R.streak === 10 || (R.streak > 10 && R.streak % 10 === 0)) {
        sfx.streak(); confetti(R.streak >= 10 ? 140 : 70);
        toast(R.streak >= 10 ? '¡Racha de ' + R.streak + '! Sos un crack 🔥' : '¡Racha de 5! Estás on fire 🔥');
      } else {
        sfx.ok();
      }
    } else {
      R.streak = 0;
      sfx.bad();
      btn.classList.add('shake');
      if (!R.clock && (R.retries[it.id] || 0) < MAX_RETRIES) {
        // Missed cards come back a few cards later, so the round ends on a win.
        R.retries[it.id] = (R.retries[it.id] || 0) + 1;
        R.queue.splice(Math.min(R.queue.length, R.pos + 4), 0, { item: it, retry: true });
      }
      if (!entry.retry && !R.misses.some(function (m) { return m.id === it.id; })) R.misses.push(it);
    }

    $('sentence').innerHTML = sentenceHTML(it, true, true);
    $('english').hidden = false;
    $('hint').hidden = true;
    $('tools').hidden = true;
    renderFeedback(it, correct, gained);
    updateHUD();

    if (R.clock && correct) {
      $('choices').hidden = true;
      setTimeout(function () { if (R && R.answered) nextCard(); }, 900);
    } else {
      R.paused = true;
      $('choices').hidden = true;
      $('next').hidden = false;
      $('next').focus({ preventScroll: true });
    }
  }

  function renderFeedback(it, correct, gained) {
    var rule = RULES[it.rule];
    var fb = $('feedback');
    fb.className = 'feedback ' + (correct ? 'ok' : 'bad');
    var head = correct ? pick(PRAISE) : pick(OOPS);
    var sub = correct ? '' : '<p>Acá va <b class="c-' + it.verb + '">' + it.verb.toUpperCase() + '</b>, no ' + it.other + '.</p>';
    var retryNote = (!correct && R.queue.slice(R.pos + 1).some(function (e) { return e.item.id === it.id; }))
      ? '<p class="muted" style="font-size:13.5px">' + BACKSOON + '</p>' : '';
    fb.innerHTML =
      '<div class="verdict"><b>' + head + '</b>' + (gained ? '<span class="pts">+' + gained + '</span>' : '') + '</div>' +
      sub +
      '<span class="rule-tag v-' + it.verb + '">' + esc(rule.name) + ' → ' + it.verb + '</span>' +
      '<p>' + esc(rule.why) + '</p>' +
      (it.note ? '<p class="tip"><b>Porteñismo:</b> ' + esc(it.note) + '</p>' : '') +
      retryNote;
    fb.hidden = false;
  }

  function endRound() {
    if (!R) return;
    if (R.timer) clearInterval(R.timer);
    var pct = R.first ? R.firstOk / R.first : 0;
    var stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
    var key = settings.game + '-' + (R.clock ? 'reloj' : 'tranqui') + '-' + settings.level;
    var best = store.best[key] || 0;
    var record_ = R.score > best && !R.label;
    if (record_) { store.best[key] = R.score; save(); }

    $('stars').innerHTML = [1, 2, 3].map(function (n) { return '<span class="' + (n <= stars ? '' : 'off') + '">⭐</span>'; }).join('');
    var titles = { 3: '¡Sos un crack!', 2: '¡Muy bien, che!', 1: '¡Buen arranque!' };
    var msgs = {
      3: 'Esto ya lo tenés re claro. Probá el nivel Pro o el contrarreloj.',
      2: 'Vas muy bien. Un par de rondas más y lo dominás.',
      1: 'Cada error que repasaste ya te quedó. La próxima sale mejor.'
    };
    $('end-title').textContent = titles[stars];
    $('end-msg').textContent = (record_ ? '¡Nuevo récord! ' : '') + msgs[stars];
    $('end-stats').innerHTML =
      '<div class="stat"><b>' + R.score + '</b><span>Puntos' + (best && !record_ ? ' · récord ' + best : '') + '</span></div>' +
      '<div class="stat"><b>' + Math.round(pct * 100) + '%</b><span>Al primer intento</span></div>' +
      '<div class="stat"><b>' + R.bestStreak + '</b><span>Mejor racha</span></div>';

    var rules = Object.keys(R.ruleTally);
    $('end-rules-panel').hidden = !rules.length;
    $('end-rules').innerHTML = rules.map(function (r) { return masteryRow(r, R.ruleTally[r]); }).join('');

    $('end-miss-panel').hidden = !R.misses.length;
    $('retry-miss').hidden = !R.misses.length;
    $('end-miss').innerHTML = R.misses.map(function (it) {
      return '<div class="miss"><span class="s">' + sentenceHTML(it, true) + '</span>' +
        '<small>' + esc(it.en) + '</small>' +
        '<small><b class="c-' + it.verb + '">' + esc(RULES[it.rule].name) + ' → ' + it.verb + '.</b> ' + esc(RULES[it.rule].why) + '</small></div>';
    }).join('');

    R.done = true;
    show('end');
    if (stars === 3 && R.first) { sfx.end(); confetti(160); }
  }

  $('again').addEventListener('click', function () {
    var label = R && R.label;
    if (label === 'repaso') startWeak(); else startRound();
  });
  $('retry-miss').addEventListener('click', function () { if (R && R.misses.length) startRound(R.misses.slice(), 'errores'); });
  $('to-home').addEventListener('click', function () { renderHome(); show('home'); });

  // ---------- Mastery rows ----------
  function ruleColor(r) {
    var v = RULES[r].verb;
    return v === 'both' ? 'var(--sol)' : 'var(--' + v + ')';
  }
  function masteryRow(r, tally) {
    var s = ruleStats(r);
    var width = tally ? (tally.ok / tally.n) * 100 : s.pct * 100;
    var badge = tally ? tally.ok + ' / ' + tally.n : LEVEL_NAMES[s.level];
    var lvl = tally ? (tally.ok === tally.n ? 3 : tally.ok / tally.n >= 0.5 ? 2 : 1) : s.level;
    return '<div class="mrow"><span class="name">' + esc(RULES[r].name) + '</span>' +
      '<span class="mbar"><i style="width:' + width + '%;background:' + ruleColor(r) + '"></i></span>' +
      '<span class="badge s' + lvl + '">' + badge + '</span></div>';
  }

  // ---------- Progress ----------
  function renderProgress() {
    var seen = ITEMS.filter(function (it) { return store.items[it.id]; }).length;
    var solid = ITEMS.filter(function (it) { var st = store.items[it.id]; return st && st.b >= 2; }).length;
    var mastered = Object.keys(RULES).filter(function (r) { return ruleStats(r).level === 3; }).length;
    $('prog-stats').innerHTML =
      '<div class="stat"><b>' + seen + '</b><span>de ' + ITEMS.length + ' escenas vistas</span></div>' +
      '<div class="stat"><b>' + solid + '</b><span>escenas firmes</span></div>' +
      '<div class="stat"><b>' + mastered + '</b><span>de ' + Object.keys(RULES).length + ' reglas dominadas</span></div>';
    var groups = [
      ['ser', 'Ser'], ['estar', 'Estar'], ['both', 'Ser y estar'], ['tener', 'Tener'], ['hacer', 'Hacer']
    ];
    var html = groups.map(function (g) {
      var rules = Object.keys(RULES).filter(function (r) { return RULES[r].verb === g[0]; });
      return '<div class="panel"><h3 class="group-title ' + (g[0] === 'both' ? '' : 'c-' + g[0]) + '">' + g[1] + '</h3><div class="mastery">' +
        rules.map(function (r) { return masteryRow(r); }).join('') + '</div></div>';
    }).join('');
    var weak = weakRules();
    if (weak.length) {
      html = '<div class="weak"><p>Tus puntos flojos: <b>' + weak.slice(0, 4).map(function (r) { return esc(RULES[r].name); }).join(', ') +
        '</b>.</p><button class="btn" id="prog-weak">Repasar</button></div>' + html;
    }
    $('prog-body').innerHTML = html;
    var pw = $('prog-weak');
    if (pw) pw.addEventListener('click', startWeak);
    $('reset-zone').innerHTML = '<button class="btn" id="reset">Borrar progreso</button>';
  }
  $('reset-zone').addEventListener('click', function (e) {
    if (e.target.id === 'reset') {
      $('reset-zone').innerHTML = '<span>¿Seguro? Se borra todo tu historial.</span>' +
        '<button class="btn" id="reset-yes">Sí, borrar</button><button class="btn" id="reset-no">Cancelar</button>';
    } else if (e.target.id === 'reset-yes') {
      store.items = {}; store.rules = {}; store.best = {}; save(); renderProgress();
    } else if (e.target.id === 'reset-no') {
      renderProgress();
    }
  });

  // ---------- Guide ----------
  var TRAPS = {
    se: [
      '<b>La fiesta es en lo de Juan</b>, pero <b>lo de Juan está en Belgrano</b>. Events use SER; places use ESTAR.',
      '<b>Es tarde</b> and <b>es temprano</b> take SER, even though they change.',
      '<b>Está muerto</b>: dead is a resulting state, so ESTAR.',
      '<b>¿Cuánto es?</b> asks for the total. <b>¿A cuánto está?</b> asks today’s price.',
      '<b>Es la una</b>, but <b>son las dos</b>: the verb agrees with the hour.',
      '<b>Soy de Boca</b> means you support Boca. It’s identity, so SER.'
    ],
    th: [
      '<b>Hace frío</b> (the weather) vs. <b>tengo frío</b> (you feel it). Ask: is a person feeling it?',
      '<b>Tengo 30 años</b>. Age is had, never “soy 30”.',
      '<b>Hace dos años</b> = two years ago. <b>Hace media hora que espero</b> = I’ve been waiting for half an hour.',
      '<b>Me hacen falta unas vacaciones</b>: hacer falta agrees with the thing needed.',
      'Vos commands: <b>tené cuidado</b>, <b>hacé la cama</b> (not ten, haz).'
    ]
  };
  function renderGuide(tab) {
    document.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tab === tab); });
    var verbs = PAIRS[tab];
    var html = '<div class="panel"><h3>Trampas clásicas</h3>' + TRAPS[tab].map(function (t) { return '<div class="trap">' + t + '</div>'; }).join('') + '</div>';
    html += '<div class="panel"><h3>Conjugación con vos</h3><div class="table-wrap"><table><thead><tr><th></th>' +
      verbs.map(function (v) { return '<th class="c-' + v + '">' + v + '</th>'; }).join('') + '</tr></thead><tbody>';
    var rows = [['yo', 'pres', '1s'], ['vos', 'pres', '2s'], ['él / ella / usted', 'pres', '3s'], ['nosotros', 'pres', '1p'], ['ustedes / ellos', 'pres', '3p'],
      ['pasado (yo)', 'pret', '1s'], ['pasado (vos)', 'pret', '2s'], ['imperfecto (yo)', 'impf', '1s']];
    rows.forEach(function (r) {
      html += '<tr><td' + (r[0] === 'vos' ? ' class="vos"' : '') + '>' + r[0] + '</td>' + verbs.map(function (v) {
        return '<td' + (r[0] === 'vos' ? ' class="vos c-' + v + '"' : '') + '>' + FORMS[r[1]][r[2]][VERBS.indexOf(v)] + '</td>';
      }).join('') + '</tr>';
    });
    html += '</tbody></table></div><p class="muted" style="margin:0;font-size:14px">In the Río de la Plata, <b>vos</b> replaces tú (vos sos, vos tenés) and <b>ustedes</b> replaces vosotros.</p></div>';

    verbs.concat(tab === 'se' ? ['both'] : []).forEach(function (v) {
      var rules = Object.keys(RULES).filter(function (r) { return RULES[r].verb === v; });
      html += '<div class="panel"><h3 class="group-title ' + (v === 'both' ? '' : 'c-' + v) + '">' + (v === 'both' ? 'Cambian el sentido' : cap(v)) + '</h3>';
      rules.forEach(function (r) {
        var ex = ITEMS.filter(function (it) { return it.rule === r; }).slice(0, 2);
        html += '<div class="rule-card"><b>' + esc(RULES[r].name) + '</b><p>' + esc(RULES[r].why) + '</p><ul>' +
          ex.map(function (it) { return '<li>' + sentenceHTML(it, true) + '</li>'; }).join('') + '</ul></div>';
      });
      html += '</div>';
    });
    $('guide-body').innerHTML = html;
  }
  $('guide-tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]'); if (b) renderGuide(b.dataset.tab);
  });

  // ---------- Keyboard ----------
  document.addEventListener('keydown', function (e) {
    if ($('play').hidden || !R || R.done) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (!R.answered) {
      var verbs = PAIRS[R.queue[R.pos].item.pair];
      var idx = (k === '1' || k === 'ArrowLeft') ? 0 : (k === '2' || k === 'ArrowRight') ? 1 : -1;
      if (idx >= 0) {
        e.preventDefault();
        answer(verbs[idx], $('choices').querySelector('[data-verb="' + verbs[idx] + '"]'));
      } else if (k === 'h' || k === 'H') showHint();
      else if (k === 't' || k === 'T') showEnglish();
    } else if ((k === 'Enter' || k === ' ') && !$('next').hidden) {
      e.preventDefault();
      $('next').click();
    }
    if (k === 'Escape') $('quit').click();
  });

  renderHome();
  show('home');
})();
