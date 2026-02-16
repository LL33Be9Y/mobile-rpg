// Main - bootstraps the game UI and wires all modules together
(() => {
  // DOM References
  const $ = (id) => document.getElementById(id);

  const screens = {
    title: $('screen-title'),
    game: $('screen-game'),
    menu: $('screen-menu'),
    inventory: $('screen-inventory'),
    quests: $('screen-quests'),
    stats: $('screen-stats'),
  };

  const els = {
    hpVal: $('hp-val'),
    mpVal: $('mp-val'),
    goldVal: $('gold-val'),
    lvlVal: $('lvl-val'),
    locationName: $('location-name'),
    locationDesc: $('location-desc'),
    locationArea: $('location-area'),
    npcArea: $('npc-area'),
    navArea: $('nav-area'),
    dialogueOverlay: $('dialogue-overlay'),
    dialoguePortrait: $('dialogue-portrait'),
    dialogueSpeaker: $('dialogue-speaker'),
    dialogueText: $('dialogue-text'),
    dialogueChoices: $('dialogue-choices'),
    dialogueAdvance: $('dialogue-advance'),
    toast: $('toast'),
    inventoryList: $('inventory-list'),
    questList: $('quest-list'),
    statsDisplay: $('stats-display'),
  };

  let toastTimer = null;

  // === Screen Management ===
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function showOverlay(name) {
    screens[name].classList.add('active');
  }

  function hideOverlay(name) {
    screens[name].classList.remove('active');
  }

  // === Toast Notifications ===
  function showToast(message, type) {
    els.toast.textContent = message;
    els.toast.className = type ? 'toast-' + type : '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.add('hidden');
    }, 2500);
  }

  // === Update HUD ===
  function updateHUD() {
    const p = GameState.getPlayer();
    els.hpVal.textContent = p.hp;
    els.mpVal.textContent = p.mp;
    els.goldVal.textContent = p.gold;
    els.lvlVal.textContent = p.level;
  }

  // === Render Location ===
  function renderLocation() {
    const state = GameState.get();
    const loc = Locations[state.currentLocation];
    if (!loc) return;

    els.locationName.textContent = loc.name;
    els.locationDesc.textContent = loc.description;
    els.locationArea.style.backgroundColor = loc.bgColor;

    renderNPCs(loc);
    renderExits(loc);
    updateHUD();
  }

  // === Render NPCs ===
  function renderNPCs(loc) {
    els.npcArea.innerHTML = '';
    for (const npcId of loc.npcs) {
      const char = Characters[npcId];
      if (!char) continue;

      const card = document.createElement('div');
      card.className = 'npc-card';
      card.style.borderColor = char.color + '40';
      card.innerHTML =
        '<span class="npc-portrait">' + char.portrait + '</span>' +
        '<span class="npc-name">' + char.name + '</span>' +
        '<span class="npc-title">' + char.title + '</span>';

      card.addEventListener('click', () => startDialogue(char));
      els.npcArea.appendChild(card);
    }
  }

  // === Render Exits ===
  function renderExits(loc) {
    els.navArea.innerHTML = '';
    for (const exit of loc.exits) {
      // Check conditional exits
      if (exit.condition && !GameState.checkCondition(exit.condition)) {
        continue;
      }

      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.innerHTML =
        '<span class="nav-icon">' + exit.icon + '</span>' +
        '<span>' + exit.label + '</span>';

      btn.addEventListener('click', () => {
        GameState.setLocation(exit.to);
        renderLocation();
      });
      els.navArea.appendChild(btn);
    }
  }

  // === Dialogue System ===
  function startDialogue(char) {
    const dialogue = Dialogues[char.dialogueId];
    if (!dialogue) {
      showToast(char.name + ' has nothing to say.', 'danger');
      return;
    }

    DialogueEngine.start(dialogue, 'start', {
      onUpdate: renderDialogueNode,
      onEnd: endDialogue,
    });
  }

  function renderDialogueNode(data) {
    els.dialogueOverlay.classList.remove('hidden');
    els.dialoguePortrait.textContent = data.portrait || '';
    els.dialogueSpeaker.textContent = data.speaker || '';
    els.dialogueText.textContent = data.text;

    // Render choices
    els.dialogueChoices.innerHTML = '';

    if (data.choices && data.choices.length > 0) {
      els.dialogueAdvance.classList.add('hidden');

      data.choices.forEach((choice, idx) => {
        // Null next means end of dialogue
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
          if (choice.next === null) {
            endDialogue();
          } else {
            DialogueEngine.selectChoice(idx);
          }
        });
        els.dialogueChoices.appendChild(btn);
      });
    } else if (data.isEnd) {
      // End node - show advance to close
      els.dialogueAdvance.classList.remove('hidden');
      els.dialogueAdvance.textContent = 'Close';
    } else {
      // Auto-advance node
      els.dialogueAdvance.classList.remove('hidden');
      els.dialogueAdvance.textContent = 'Continue ▶';
    }

    updateHUD();
  }

  function endDialogue() {
    els.dialogueOverlay.classList.add('hidden');
    DialogueEngine.end();
    renderLocation();
    autoSave();
  }

  // === Inventory ===
  function renderInventory() {
    const items = GameState.get().inventory;
    if (items.length === 0) {
      els.inventoryList.innerHTML = '<div class="empty-state">Your inventory is empty.</div>';
      return;
    }

    els.inventoryList.innerHTML = '';
    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML =
        '<div class="item-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="item-desc">' + escapeHtml(item.description) + '</div>' +
        (item.quantity > 1 ? '<div class="item-qty">x' + item.quantity + '</div>' : '');
      els.inventoryList.appendChild(card);
    }
  }

  // === Quests ===
  function renderQuests() {
    const quests = GameState.get().quests;
    if (quests.length === 0) {
      els.questList.innerHTML = '<div class="empty-state">No active quests.</div>';
      return;
    }

    els.questList.innerHTML = '';
    // Active quests first, then completed
    const sorted = [...quests].sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return 0;
    });

    for (const quest of sorted) {
      const card = document.createElement('div');
      card.className = 'quest-card' + (quest.status === 'completed' ? ' completed' : '');
      const statusClass = quest.status === 'active' ? 'active' : 'done';
      const statusText = quest.status === 'active' ? '● Active' : '✓ Completed';
      card.innerHTML =
        '<div class="quest-name">' + escapeHtml(quest.name) + '</div>' +
        '<div class="quest-desc">' + escapeHtml(quest.description) + '</div>' +
        '<div class="quest-status ' + statusClass + '">' + statusText + '</div>';
      els.questList.appendChild(card);
    }
  }

  // === Stats ===
  function renderStats() {
    const p = GameState.getPlayer();
    const state = GameState.get();

    const stats = [
      ['Name', p.name],
      ['Level', p.level],
      ['HP', p.hp + ' / ' + p.maxHp],
      ['MP', p.mp + ' / ' + p.maxMp],
      ['Gold', p.gold],
      ['Attack', p.attack],
      ['Defense', p.defense],
      ['Magic', p.magic],
      ['Chapter', state.chapter],
    ];

    let html = '';
    for (const [label, value] of stats) {
      html += '<div class="stat-row"><span class="stat-label">' + label + '</span><span class="stat-value">' + value + '</span></div>';
    }

    // XP bar
    const pct = Math.floor((p.xp / p.xpToNext) * 100);
    html +=
      '<div class="xp-bar-container">' +
        '<div class="xp-bar"><div class="xp-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="xp-label">XP: ' + p.xp + ' / ' + p.xpToNext + '</div>' +
      '</div>';

    els.statsDisplay.innerHTML = html;
  }

  // === Save / Load ===
  function autoSave() {
    SaveSystem.save(GameState.serialize());
  }

  function loadGame() {
    const saved = SaveSystem.load();
    if (saved) {
      GameState.init(saved);
      return true;
    }
    return false;
  }

  // === Utility ===
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // === Event Listeners ===
  function bindEvents() {
    // Title screen
    $('btn-new-game').addEventListener('click', () => {
      GameState.init();
      showScreen('game');
      renderLocation();
      autoSave();
    });

    $('btn-continue').addEventListener('click', () => {
      loadGame();
      showScreen('game');
      renderLocation();
    });

    // Menu
    $('btn-menu').addEventListener('click', () => showOverlay('menu'));
    $('btn-close-menu').addEventListener('click', () => hideOverlay('menu'));

    $('btn-inventory').addEventListener('click', () => {
      hideOverlay('menu');
      renderInventory();
      showOverlay('inventory');
    });

    $('btn-quests').addEventListener('click', () => {
      hideOverlay('menu');
      renderQuests();
      showOverlay('quests');
    });

    $('btn-stats').addEventListener('click', () => {
      hideOverlay('menu');
      renderStats();
      showOverlay('stats');
    });

    $('btn-save').addEventListener('click', () => {
      autoSave();
      hideOverlay('menu');
      showToast('Game saved!', 'gold');
    });

    $('btn-main-menu').addEventListener('click', () => {
      autoSave();
      hideOverlay('menu');
      showScreen('title');
    });

    $('btn-close-inventory').addEventListener('click', () => hideOverlay('inventory'));
    $('btn-close-quests').addEventListener('click', () => hideOverlay('quests'));
    $('btn-close-stats').addEventListener('click', () => hideOverlay('stats'));

    // Dialogue advance button
    els.dialogueAdvance.addEventListener('click', () => {
      if (els.dialogueAdvance.textContent === 'Close') {
        endDialogue();
      } else {
        DialogueEngine.advance();
      }
    });
  }

  // === Init ===
  function init() {
    bindEvents();

    // Show continue button if save exists
    if (SaveSystem.hasSave()) {
      $('btn-continue').style.display = '';
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
