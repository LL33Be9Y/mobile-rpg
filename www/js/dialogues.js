// Dialogues - all dialogue trees for NPCs
const Dialogues = {
  // === ELDER ROWAN - Village Square ===
  elder_main: {
    nodes: {
      start: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'Ah, young one. These are troubled times. The Whispering Woods grow darker each day, and the crops wither despite the rain.',
        choices: [
          { text: 'What is happening to the village?', next: 'explain_problem' },
          { text: 'How can I help?', next: 'offer_help' },
          { text: 'Tell me about yourself.', next: 'about_elder' },
          { text: 'Goodbye.', next: null },
        ],
      },
      explain_problem: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'An ancient corruption stirs beneath the ruins north of here. Legend speaks of a crystal that once protected these lands... but it has been twisted by dark forces. If nothing is done, Willowbrook will perish.',
        effects: [{ type: 'set_flag', flag: 'knows_corruption' }],
        choices: [
          { text: 'Where are these ruins?', next: 'ruins_location' },
          { text: 'Is there a way to purify the crystal?', next: 'purify_info' },
          { text: 'I must go.', next: null },
        ],
      },
      ruins_location: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'The ruins lie deep within the Whispering Woods. But beware - the path is treacherous. Speak with Pip, the forest sprite. She knows the way. I have marked it on your map.',
        effects: [
          { type: 'set_flag', flag: 'knows_ruins_location' },
          { type: 'add_quest', quest: { id: 'find_ruins', name: 'The Ancient Ruins', description: 'Find the ancient ruins in the Whispering Woods. Pip the sprite may know the way.' } },
          { type: 'add_xp', amount: 20 },
        ],
        choices: [
          { text: 'Thank you, Elder.', next: 'elder_thanks' },
        ],
      },
      purify_info: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'The old texts mention a Purification Ritual. You would need three things: a Moonstone from the forest, blessed water from our fountain, and the ancient incantation. The bard Lyra may know the incantation - she sings of old magic.',
        effects: [
          { type: 'set_flag', flag: 'knows_purification' },
          { type: 'add_quest', quest: { id: 'purify_crystal', name: 'The Purification Ritual', description: 'Gather the Moonstone, Blessed Water, and the Ancient Incantation to purify the corrupted crystal.' } },
        ],
        choices: [
          { text: 'Where can I find the Moonstone?', next: 'moonstone_info' },
          { text: 'I will speak with Lyra.', next: 'elder_thanks' },
        ],
      },
      moonstone_info: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'Moonstones are rare. Pip the forest sprite collects them. If you befriend her, she may part with one. Forest sprites are fond of sweet things and kind words.',
        choices: [
          { text: 'I understand. Thank you.', next: 'elder_thanks' },
        ],
      },
      offer_help: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'Your courage warms my old heart. If you truly wish to help, I need you to investigate the source of the corruption. But first, you should prepare. Visit Gorn the blacksmith for a weapon, and Tessa may have supplies for the journey.',
        effects: [
          { type: 'set_flag', flag: 'elder_quest_accepted' },
          { type: 'add_quest', quest: { id: 'prepare_journey', name: 'Prepare for the Journey', description: 'Visit the blacksmith and merchant to prepare for investigating the corruption.' } },
          { type: 'change_relationship', npcId: 'elder_rowan', amount: 2 },
        ],
        choices: [
          { text: 'I will prepare at once.', next: 'elder_thanks' },
          { text: 'What exactly am I facing?', next: 'explain_problem' },
        ],
      },
      about_elder: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'I have watched over Willowbrook for forty years. I was once an adventurer myself, believe it or not. But age catches up with us all. Now I protect this village with wisdom rather than a sword.',
        effects: [{ type: 'change_relationship', npcId: 'elder_rowan', amount: 1 }],
        choices: [
          { text: 'You were an adventurer?', next: 'elder_past' },
          { text: 'What troubles the village?', next: 'explain_problem' },
          { text: 'Farewell, Elder.', next: null },
        ],
      },
      elder_past: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'Ha! I once slew a dragon in the Scorched Peaks. Well... it was more of a large lizard. But the point stands! I know danger when I see it, and what stirs in those ruins is no mere lizard.',
        effects: [{ type: 'change_relationship', npcId: 'elder_rowan', amount: 1 }],
        choices: [
          { text: 'Tell me about the ruins.', next: 'explain_problem' },
          { text: 'Ha! Good story. Farewell.', next: null },
        ],
      },
      elder_thanks: {
        speaker: 'Elder Rowan',
        portrait: '👴',
        text: 'May the old gods watch over you, young one. Return to me if you need guidance.',
        choices: [
          { text: 'Farewell.', next: null },
        ],
      },
    },
  },

  // === MERCHANT TESSA - Village Square ===
  merchant_main: {
    nodes: {
      start: {
        speaker: 'Tessa',
        portrait: '👩‍🦰',
        text: 'Welcome, welcome! Best goods in all the land, right here! What catches your eye?',
        choices: [
          { text: 'What do you have for sale?', next: 'shop_menu' },
          { text: 'Any news from your travels?', next: 'travel_news' },
          { text: 'Just looking. Goodbye.', next: null },
        ],
      },
      shop_menu: {
        speaker: 'Tessa',
        portrait: '👩‍🦰',
        text: 'I have healing potions, antidotes, and some rare trinkets. Business has been slow with all the gloom around here.',
        choices: [
          { text: 'Buy Health Potion (30 gold)', next: 'buy_potion', condition: { type: 'gold_gte', amount: 30 } },
          { text: 'Buy Antidote (20 gold)', next: 'buy_antidote', condition: { type: 'gold_gte', amount: 20 } },
          { text: 'Buy Blessed Water (50 gold)', next: 'buy_blessed_water', condition: { type: 'gold_gte', amount: 50 } },
          { text: 'Buy Honey Cake (10 gold)', next: 'buy_honey_cake', condition: { type: 'gold_gte', amount: 10 } },
          { text: 'Never mind.', next: null },
        ],
      },
      buy_potion: {
        speaker: 'Tessa',
        portrait: '👩‍🦰',
        text: 'A wise purchase! This potion will restore your health when you need it most.',
        effects: [
          { type: 'add_gold', amount: -30 },
          { type: 'add_item', item: { id: 'health_potion', name: 'Health Potion', description: 'Restores 50 HP', type: 'consumable' } },
          { type: 'change_relationship', npcId: 'merchant_tessa', amount: 1 },
        ],
        choices: [
          { text: 'Anything else?', next: 'shop_menu' },
          { text: 'Thanks! Goodbye.', next: null },
        ],
      },
      buy_antidote: {
        speaker: 'Tessa',
        portrait: '👩‍🦰',
        text: 'Smart! The woods are full of venomous creatures these days. Keep this handy.',
        effects: [
          { type: 'add_gold', amount: -20 },
          { type: 'add_item', item: { id: 'antidote', name: 'Antidote', description: 'Cures poison', type: 'consumable' } },
          { type: 'change_relationship', npcId: 'merchant_tessa', amount: 1 },
        ],
        choices: [
          { text: 'Anything else?', next: 'shop_menu' },
          { text: 'Thanks! Goodbye.', next: null },
        ],
      },
      buy_blessed_water: {
        speaker: 'Tessa',
        portrait: '👩‍🦰',
        text: 'Ah, the Blessed Water from the village fountain! Elder Rowan blessed it himself. I hear it has... purifying properties.',
        effects: [
          { type: 'add_gold', amount: -50 },
          { type: 'add_item', item: { id: 'blessed_water', name: 'Blessed Water', description: 'Water blessed by Elder Rowan. Said to purify corruption.', type: 'quest' } },
          { type: 'change_relationship', npcId: 'merchant_tessa', amount: 2 },
          { type: 'set_flag', flag: 'has_blessed_water' },
        ],
        choices: [
          { text: 'This might be just what I need.', next: 'shop_menu' },
          { text: 'Thanks! Goodbye.', next: null },
        ],
      },
      buy_honey_cake: {
        speaker: 'Tessa',
        portrait: '👩‍🦰',
        text: 'Honey cake! Fresh from the bakery this morning. Perfect for a sweet tooth... or a certain forest sprite, perhaps?',
        effects: [
          { type: 'add_gold', amount: -10 },
          { type: 'add_item', item: { id: 'honey_cake', name: 'Honey Cake', description: 'A delicious honey cake. Forest sprites love these.', type: 'consumable' } },
          { type: 'change_relationship', npcId: 'merchant_tessa', amount: 1 },
        ],
        choices: [
          { text: 'Anything else?', next: 'shop_menu' },
          { text: 'Thanks! Goodbye.', next: null },
        ],
      },
      travel_news: {
        speaker: 'Tessa',
        portrait: '👩‍🦰',
        text: 'I came through the eastern pass last week. Strange things happening everywhere - crops dying, animals fleeing. The other villages say it all started a month ago. Some dark energy spreading from the north...',
        effects: [{ type: 'set_flag', flag: 'heard_travel_news' }],
        choices: [
          { text: 'From the north? The ruins perhaps?', next: 'ruins_rumor', condition: { type: 'flag', flag: 'knows_corruption' } },
          { text: 'That sounds troubling. Show me your wares.', next: 'shop_menu' },
          { text: 'I see. Farewell.', next: null },
        ],
      },
      ruins_rumor: {
        speaker: 'Tessa',
        portrait: '👩‍🦰',
        text: 'The ruins? I have heard stories... A merchant from the north said he saw ghostly lights coming from that direction. Be careful if you go there. Here, take this charm - on the house.',
        effects: [
          { type: 'add_item', item: { id: 'lucky_charm', name: 'Lucky Charm', description: 'A small charm from Tessa. Might bring good fortune.', type: 'accessory' } },
          { type: 'change_relationship', npcId: 'merchant_tessa', amount: 3 },
        ],
        choices: [
          { text: 'Thank you, Tessa!', next: null },
        ],
      },
    },
  },

  // === BARD LYRA - Tavern ===
  bard_main: {
    nodes: {
      start: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: '♪ In shadows deep where crystals sleep, a darkness waits below... ♪ Oh! A visitor. Forgive me, I was lost in an old melody.',
        choices: [
          { text: 'That song... what is it about?', next: 'song_meaning' },
          { text: 'Can you play something for me?', next: 'play_song' },
          { text: 'Do you know the Ancient Incantation?', next: 'incantation', condition: { type: 'flag', flag: 'knows_purification' } },
          { text: 'Just passing through. Goodbye.', next: null },
        ],
      },
      song_meaning: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: 'It is a very old song, from before Willowbrook was founded. It speaks of a crystal of great power, hidden beneath ancient ruins. The song says it was placed there to protect the land... but all things can be corrupted, given enough time.',
        effects: [{ type: 'set_flag', flag: 'heard_lyra_song' }],
        choices: [
          { text: 'The crystal the Elder mentioned...', next: 'crystal_connection', condition: { type: 'flag', flag: 'knows_corruption' } },
          { text: 'Do you know more old songs?', next: 'play_song' },
          { text: 'Interesting. Farewell.', next: null },
        ],
      },
      crystal_connection: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: 'So Elder Rowan has told you of the corruption? Then you should know - the second verse of that song contains the key. It is an incantation of purification. I can teach it to you, if you bring me proof of your resolve.',
        choices: [
          { text: 'What proof do you need?', next: 'lyra_quest' },
          { text: 'I will return when I am ready.', next: null },
        ],
      },
      lyra_quest: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: 'Bring me a Moonstone from the Whispering Woods. They resonate with the same ancient magic as the incantation. If you can find one, it will prove you are attuned to the old forces.',
        effects: [
          { type: 'set_flag', flag: 'lyra_wants_moonstone' },
          { type: 'change_relationship', npcId: 'bard_lyra', amount: 2 },
        ],
        choices: [
          { text: 'I will find a Moonstone.', next: null },
          { text: 'Where do I find one?', next: 'moonstone_hint' },
        ],
      },
      moonstone_hint: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: 'The forest sprite Pip is known to collect them. She is playful but kind. Show her respect and she may help you.',
        choices: [
          { text: 'I will seek out Pip. Thank you.', next: null },
        ],
      },
      incantation: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: 'The Ancient Incantation? You seek to purify the crystal!',
        choices: [
          { text: '[Give Moonstone]', next: 'teach_incantation', condition: { type: 'has_item', itemId: 'moonstone' } },
          { text: 'I need to find a Moonstone first.', next: 'lyra_quest' },
        ],
      },
      teach_incantation: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: '♪ Light of moon and star of old, cleanse the darkness, break the hold. By earth and sky, by flame and sea, as it was, so let it be! ♪ There. The incantation is yours now. Use it wisely at the crystal.',
        effects: [
          { type: 'remove_item', itemId: 'moonstone', quantity: 1 },
          { type: 'add_item', item: { id: 'ancient_incantation', name: 'Ancient Incantation', description: 'A purification chant taught by Lyra the bard.', type: 'quest' } },
          { type: 'set_flag', flag: 'has_incantation' },
          { type: 'change_relationship', npcId: 'bard_lyra', amount: 5 },
          { type: 'add_xp', amount: 50 },
        ],
        choices: [
          { text: 'Thank you, Lyra. I won\'t forget this.', next: null },
        ],
      },
      play_song: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: '♪ Oh the hills of green, the rivers clean, the world before the dark... Where heroes bold and stories told would light the fading spark... ♪ Did you enjoy it?',
        effects: [
          { type: 'heal', amount: 20 },
          { type: 'change_relationship', npcId: 'bard_lyra', amount: 1 },
        ],
        choices: [
          { text: 'Beautiful! I feel refreshed.', next: 'song_thanks' },
          { text: 'Tell me about the darker song.', next: 'song_meaning' },
        ],
      },
      song_thanks: {
        speaker: 'Lyra',
        portrait: '🎵',
        text: 'Music heals the soul, and sometimes the body too. Come back anytime you need a tune.',
        choices: [
          { text: 'I will. Farewell.', next: null },
        ],
      },
    },
  },

  // === STRANGER KAEL - Tavern ===
  stranger_main: {
    nodes: {
      start: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: '... You stare too long, stranger. Either sit down and talk, or move along.',
        choices: [
          { text: 'Who are you?', next: 'kael_intro' },
          { text: 'I hear you know about the ruins.', next: 'kael_ruins', condition: { type: 'flag', flag: 'knows_ruins_location' } },
          { text: 'Sorry to bother you.', next: null },
        ],
      },
      kael_intro: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: 'Nobody important. Just a traveler who has seen too much. I came to this village hoping for peace and quiet, but even here the shadows are growing.',
        effects: [{ type: 'set_flag', flag: 'met_kael' }],
        choices: [
          { text: 'What shadows?', next: 'kael_shadows' },
          { text: 'You look like a fighter.', next: 'kael_fighter' },
          { text: 'I understand. Goodbye.', next: null },
        ],
      },
      kael_shadows: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: 'I have fought corruption like this before, in the Eastern Kingdoms. It starts small - dying plants, strange sounds at night. Then people start disappearing. You need to stop it before it reaches that stage.',
        effects: [{ type: 'set_flag', flag: 'kael_warning' }],
        choices: [
          { text: 'Will you help me fight it?', next: 'kael_help' },
          { text: 'What happened in the Eastern Kingdoms?', next: 'kael_backstory' },
          { text: 'I will be careful. Farewell.', next: null },
        ],
      },
      kael_fighter: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: 'Former knight of the Eastern Kingdoms. Retired. Or exiled, depending on who you ask. The details don\'t matter. What matters is I know how to handle a blade.',
        effects: [{ type: 'change_relationship', npcId: 'stranger_kael', amount: 1 }],
        choices: [
          { text: 'Could you train me?', next: 'kael_train' },
          { text: 'Why were you exiled?', next: 'kael_backstory' },
          { text: 'Interesting. Farewell.', next: null },
        ],
      },
      kael_help: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: 'Help you? Hmph. I have fought enough battles for a lifetime. But... if you prove yourself worthy, I might reconsider. Come back when you have faced real danger.',
        effects: [{ type: 'set_flag', flag: 'kael_may_help' }],
        choices: [
          { text: 'I will prove myself.', next: null },
        ],
      },
      kael_backstory: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: 'I tried to stop the corruption there. I warned them, but the king wouldn\'t listen. When I acted on my own... they called me a traitor. By the time they realized I was right, it was too late. I won\'t make the same mistake of waiting here.',
        effects: [
          { type: 'change_relationship', npcId: 'stranger_kael', amount: 3 },
          { type: 'set_flag', flag: 'knows_kael_past' },
        ],
        choices: [
          { text: 'Then help me stop it this time.', next: 'kael_convinced' },
          { text: 'That is a heavy burden.', next: null },
        ],
      },
      kael_convinced: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: '... Fine. Take this. It is a blade forged to fight dark magic. I cannot go with you into the ruins - old wounds - but this sword will serve you well. Do not fail where I did.',
        effects: [
          { type: 'add_item', item: { id: 'shadow_blade', name: 'Shadow Blade', description: 'A blade forged to fight dark magic. Given by Kael.', type: 'weapon' } },
          { type: 'set_flag', flag: 'has_shadow_blade' },
          { type: 'change_relationship', npcId: 'stranger_kael', amount: 5 },
          { type: 'add_xp', amount: 40 },
        ],
        choices: [
          { text: 'I will not fail. Thank you, Kael.', next: null },
        ],
      },
      kael_train: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: 'Train you? Ha. Fine. Here is lesson one: always expect the unexpected. And lesson two: never turn your back on the shadows. There. Training complete.',
        effects: [
          { type: 'add_xp', amount: 25 },
          { type: 'change_relationship', npcId: 'stranger_kael', amount: 2 },
        ],
        choices: [
          { text: 'That was... brief. But thank you.', next: null },
        ],
      },
      kael_ruins: {
        speaker: 'Kael',
        portrait: '🗡️',
        text: 'So you know about the ruins. Good. Then you know what needs to be done. The corruption spreads from a crystal deep within. I have seen its like before. Are you prepared to face it?',
        choices: [
          { text: 'Tell me what I am up against.', next: 'kael_shadows' },
          { text: 'Will you come with me?', next: 'kael_help' },
          { text: 'I will handle it. Goodbye.', next: null },
        ],
      },
    },
  },

  // === BLACKSMITH GORN ===
  blacksmith_main: {
    nodes: {
      start: {
        speaker: 'Gorn',
        portrait: '🔨',
        text: '*CLANG* *CLANG* Oh! A customer! Welcome to the Forge & Anvil. Need something sturdy?',
        choices: [
          { text: 'Can you forge me a weapon?', next: 'forge_weapon' },
          { text: 'Can you repair my equipment?', next: 'repair' },
          { text: 'What do you know about the ruins?', next: 'gorn_ruins', condition: { type: 'flag', flag: 'knows_ruins_location' } },
          { text: 'Just browsing. Goodbye.', next: null },
        ],
      },
      forge_weapon: {
        speaker: 'Gorn',
        portrait: '🔨',
        text: 'I can forge you a fine iron sword! Strong, reliable. Costs 40 gold for materials. What do you say?',
        choices: [
          { text: 'Forge the sword! (40 gold)', next: 'sword_forged', condition: { type: 'gold_gte', amount: 40 } },
          { text: 'Too expensive right now.', next: 'gorn_understand' },
        ],
      },
      sword_forged: {
        speaker: 'Gorn',
        portrait: '🔨',
        text: '*CLANG CLANG CLANG* There she is! A fine blade, sharp and true. Treat her well and she will return the favor in battle!',
        effects: [
          { type: 'add_gold', amount: -40 },
          { type: 'add_item', item: { id: 'iron_sword', name: 'Iron Sword', description: 'A sturdy sword forged by Gorn.', type: 'weapon' } },
          { type: 'change_relationship', npcId: 'blacksmith_gorn', amount: 3 },
          { type: 'set_flag', flag: 'has_weapon' },
        ],
        choices: [
          { text: 'Excellent work! Thank you.', next: null },
        ],
      },
      repair: {
        speaker: 'Gorn',
        portrait: '🔨',
        text: 'Let me take a look... Hmm, your gear could use some love. I will fix it up for 15 gold.',
        choices: [
          { text: 'Please repair it. (15 gold)', next: 'repaired', condition: { type: 'gold_gte', amount: 15 } },
          { text: 'Maybe later.', next: 'gorn_understand' },
        ],
      },
      repaired: {
        speaker: 'Gorn',
        portrait: '🔨',
        text: 'Good as new! Well, almost. Better than it was, at least. Stay safe out there.',
        effects: [
          { type: 'add_gold', amount: -15 },
          { type: 'heal', amount: 30 },
          { type: 'change_relationship', npcId: 'blacksmith_gorn', amount: 1 },
        ],
        choices: [
          { text: 'Thanks, Gorn!', next: null },
        ],
      },
      gorn_understand: {
        speaker: 'Gorn',
        portrait: '🔨',
        text: 'No worries! Come back when your pockets are heavier. I am not going anywhere.',
        choices: [
          { text: 'I will. Goodbye.', next: null },
        ],
      },
      gorn_ruins: {
        speaker: 'Gorn',
        portrait: '🔨',
        text: 'The ruins? Bad place. My grandfather said they were built by an ancient civilization that could shape crystals with their minds. When you go there, make sure you have a good weapon. Dark things lurk in the shadows.',
        effects: [{ type: 'set_flag', flag: 'gorn_ruins_warning' }],
        choices: [
          { text: 'Can you forge me something for the journey?', next: 'forge_weapon' },
          { text: 'I will be prepared. Thank you.', next: null },
        ],
      },
    },
  },

  // === FAIRY PIP - Whispering Woods ===
  fairy_main: {
    nodes: {
      start: {
        speaker: 'Pip',
        portrait: '🧚',
        text: '*giggle* A human! In MY forest! How fun! How exciting! Do you want to play a game?',
        choices: [
          { text: 'Sure! What game?', next: 'pip_game' },
          { text: 'I am looking for a Moonstone.', next: 'pip_moonstone', condition: { type: 'flag', flag: 'lyra_wants_moonstone' } },
          { text: 'Can you guide me to the ruins?', next: 'pip_guide', condition: { type: 'flag', flag: 'knows_ruins_location' } },
          { text: 'Not right now. Goodbye!', next: null },
        ],
      },
      pip_game: {
        speaker: 'Pip',
        portrait: '🧚',
        text: 'Yay! Okay okay okay! I spy with my little eye... something that is GREEN! Hee hee! Just kidding, everything is green here! You are fun. I like you!',
        effects: [
          { type: 'change_relationship', npcId: 'fairy_pip', amount: 2 },
          { type: 'add_xp', amount: 10 },
        ],
        choices: [
          { text: 'Ha! You are quite the trickster.', next: 'pip_happy' },
          { text: 'Do you know anything about the Moonstone?', next: 'pip_moonstone', condition: { type: 'flag', flag: 'lyra_wants_moonstone' } },
        ],
      },
      pip_happy: {
        speaker: 'Pip',
        portrait: '🧚',
        text: 'Tee hee! I like you, human! You do not try to catch me like the others. Ask me anything and I will try to help!',
        effects: [{ type: 'set_flag', flag: 'pip_friendly' }],
        choices: [
          { text: 'Do you have a Moonstone?', next: 'pip_moonstone', condition: { type: 'flag', flag: 'lyra_wants_moonstone' } },
          { text: 'Can you show me the way to the ruins?', next: 'pip_guide', condition: { type: 'flag', flag: 'knows_ruins_location' } },
          { text: 'Thanks, Pip! See you around.', next: null },
        ],
      },
      pip_moonstone: {
        speaker: 'Pip',
        portrait: '🧚',
        text: 'A Moonstone?! Those are my FAVORITE shinies! I have one... but it is my BEST shiny. Hmm... I will trade you! Bring me something sweet. I love honey cakes!',
        effects: [{ type: 'set_flag', flag: 'pip_wants_trade' }],
        choices: [
          { text: '[Give Honey Cake]', next: 'pip_trade', condition: { type: 'has_item', itemId: 'honey_cake' } },
          { text: 'Where can I find honey cakes?', next: 'pip_cake_hint' },
          { text: 'I will find something sweet. Wait here!', next: null },
        ],
      },
      pip_cake_hint: {
        speaker: 'Pip',
        portrait: '🧚',
        text: 'The tavern in the village! The barkeep makes the BEST honey cakes! Tell him Pip sent you. Or do not. He might charge extra if you mention me... I may have stolen a few.',
        choices: [
          { text: 'Ha! I will get one. Be right back.', next: null },
        ],
      },
      pip_trade: {
        speaker: 'Pip',
        portrait: '🧚',
        text: 'HONEY CAKE!! *grabs it and spins in the air* Oh it is SO GOOD! Here here here, take the shiny Moonstone! Fair trade! Best trade! We are BEST FRIENDS now!',
        effects: [
          { type: 'remove_item', itemId: 'honey_cake', quantity: 1 },
          { type: 'add_item', item: { id: 'moonstone', name: 'Moonstone', description: 'A luminescent stone that glows with ancient magic. Pip\'s favorite shiny.', type: 'quest' } },
          { type: 'set_flag', flag: 'has_moonstone' },
          { type: 'change_relationship', npcId: 'fairy_pip', amount: 5 },
          { type: 'add_xp', amount: 30 },
        ],
        choices: [
          { text: 'Thank you, Pip! Best trade indeed!', next: null },
        ],
      },
      pip_guide: {
        speaker: 'Pip',
        portrait: '🧚',
        text: 'The ruins? Ooh... that place is SCARY. But brave humans go there anyway! Follow the path where the mushrooms glow blue. But be careful - the shadow guardian does not like visitors.',
        effects: [
          { type: 'set_flag', flag: 'pip_warned_about_guardian' },
          { type: 'add_xp', amount: 15 },
        ],
        choices: [
          { text: 'Shadow guardian?', next: 'pip_guardian_info' },
          { text: 'Thank you, Pip. I will be careful.', next: null },
        ],
      },
      pip_guardian_info: {
        speaker: 'Pip',
        portrait: '🧚',
        text: 'A spooky ghost thing! It guards the entrance to the deep parts. I heard it asks a question or something. Answer wrong and POOF! You get zapped! Answer right and it lets you pass. I think...',
        choices: [
          { text: 'Good to know. Thanks, Pip!', next: null },
        ],
      },
    },
  },

  // === SHADOW FIGURE - Ancient Ruins ===
  shadow_main: {
    nodes: {
      start: {
        speaker: '???',
        portrait: '👤',
        text: 'HALT. You stand before the threshold of the Crystal Chamber. None may pass without proving their worth. What is your purpose here?',
        choices: [
          { text: 'I seek to purify the corrupted crystal.', next: 'shadow_test', condition: { type: 'flag', flag: 'knows_purification' } },
          { text: 'I am an adventurer exploring these ruins.', next: 'shadow_warning' },
          { text: 'Who are you?', next: 'shadow_identity' },
          { text: 'I will leave.', next: null },
        ],
      },
      shadow_test: {
        speaker: '???',
        portrait: '👤',
        text: 'A purifier... it has been centuries since one has come. Answer me this: What three things are needed to cleanse the crystal?',
        choices: [
          { text: 'Moonstone, Blessed Water, and the Ancient Incantation.', next: 'shadow_correct', condition: { type: 'flag', flag: 'has_incantation' } },
          { text: 'I... do not know yet.', next: 'shadow_not_ready' },
        ],
      },
      shadow_correct: {
        speaker: '???',
        portrait: '👤',
        text: 'Correct. And I sense you carry these items. You are worthy. I shall grant you the Ancient Key. Beyond lies the Crystal Chamber. Purify the crystal... and free me from my eternal watch.',
        effects: [
          { type: 'add_item', item: { id: 'ancient_key', name: 'Ancient Key', description: 'A spectral key that opens the way to the Crystal Chamber.', type: 'quest' } },
          { type: 'set_flag', flag: 'guardian_passed' },
          { type: 'add_xp', amount: 60 },
        ],
        choices: [
          { text: 'I will end this corruption. I promise.', next: 'shadow_farewell' },
        ],
      },
      shadow_farewell: {
        speaker: '???',
        portrait: '👤',
        text: 'Go then, hero. And know this: the crystal will resist. It will try to corrupt you as it has corrupted the land. Stay true to your purpose.',
        effects: [{ type: 'change_relationship', npcId: 'shadow_figure', amount: 5 }],
        choices: [
          { text: 'I am ready.', next: null },
        ],
      },
      shadow_not_ready: {
        speaker: '???',
        portrait: '👤',
        text: 'Then you are not ready. Seek the knowledge you need. The bard in the village sings of old magic. The elder knows of the ritual. Return when you have all three components.',
        choices: [
          { text: 'I will return prepared.', next: null },
        ],
      },
      shadow_warning: {
        speaker: '???',
        portrait: '👤',
        text: 'Turn back, explorer. What lies beyond is not meant for the curious. Only those who carry the means of purification may pass. The corruption would consume you.',
        effects: [{ type: 'damage', amount: 10 }],
        choices: [
          { text: 'I understand. I will prepare.', next: null },
          { text: 'I will find a way to purify the crystal.', next: 'shadow_hint' },
        ],
      },
      shadow_hint: {
        speaker: '???',
        portrait: '👤',
        text: 'Seek the Elder of Willowbrook. He knows of the ancient ritual. And seek the bard, who carries the incantation in her songs. Only then may you return.',
        effects: [{ type: 'set_flag', flag: 'shadow_hinted_ritual' }],
        choices: [
          { text: 'Thank you, guardian.', next: null },
        ],
      },
      shadow_identity: {
        speaker: '???',
        portrait: '👤',
        text: 'I am the last guardian of the Crystal Chamber. I was placed here by the ancients to prevent the unworthy from reaching the crystal. For centuries I have watched as the crystal slowly corrupted. I cannot purify it myself. That task falls to a mortal.',
        effects: [{ type: 'change_relationship', npcId: 'shadow_figure', amount: 2 }],
        choices: [
          { text: 'I will purify the crystal.', next: 'shadow_test', condition: { type: 'flag', flag: 'knows_purification' } },
          { text: 'I will return when I am ready.', next: null },
        ],
      },
    },
  },

  // === DARK CRYSTAL - Crystal Chamber (Final encounter) ===
  crystal_main: {
    nodes: {
      start: {
        speaker: 'The Corrupted Crystal',
        portrait: '💎',
        text: 'YOU DARE ENTER MY DOMAIN? I can feel your fear, mortal. This power is beyond your comprehension. Turn back now, and I may let you leave with your mind intact.',
        choices: [
          { text: 'I have come to purify you!', next: 'crystal_fight' },
          { text: 'What are you?', next: 'crystal_identity' },
          { text: '[Use the Purification Ritual]', next: 'purify_attempt', condition: { type: 'has_item', itemId: 'ancient_incantation' } },
        ],
      },
      crystal_identity: {
        speaker: 'The Corrupted Crystal',
        portrait: '💎',
        text: 'I was once the Heart of the Land - a crystal of pure energy that nourished all living things. But centuries of neglect allowed the darkness to seep in. Now I am something... greater. Why would you destroy such power?',
        choices: [
          { text: 'Because you are killing the land and its people.', next: 'crystal_defiant' },
          { text: 'Perhaps we can make a deal?', next: 'crystal_tempt' },
          { text: '[Begin the Purification Ritual]', next: 'purify_attempt', condition: { type: 'has_item', itemId: 'ancient_incantation' } },
        ],
      },
      crystal_fight: {
        speaker: 'The Corrupted Crystal',
        portrait: '💎',
        text: 'FOOL! You cannot purify me with brute force alone!',
        effects: [{ type: 'damage', amount: 30 }],
        choices: [
          { text: '[Use the Purification Ritual]', next: 'purify_attempt', condition: { type: 'has_item', itemId: 'ancient_incantation' } },
          { text: 'I need to find another way...', next: 'crystal_retreat' },
        ],
      },
      crystal_tempt: {
        speaker: 'The Corrupted Crystal',
        portrait: '💎',
        text: 'Yesss... a deal. I can give you power beyond imagination. Wealth, strength, magic - all yours. Simply walk away and let me continue my work. The village is small. The world is large. What does one village matter?',
        choices: [
          { text: 'Every village matters. [Begin Purification]', next: 'purify_attempt', condition: { type: 'has_item', itemId: 'ancient_incantation' } },
          { text: 'Accept the crystal\'s offer.', next: 'dark_ending' },
          { text: 'I need time to think...', next: 'crystal_retreat' },
        ],
      },
      crystal_defiant: {
        speaker: 'The Corrupted Crystal',
        portrait: '💎',
        text: 'Sentimental fool. The weak perish so the strong may thrive. But you will learn this lesson the hard way!',
        effects: [{ type: 'damage', amount: 20 }],
        choices: [
          { text: '[Use the Purification Ritual]', next: 'purify_attempt', condition: { type: 'has_item', itemId: 'ancient_incantation' } },
          { text: 'I will return stronger.', next: 'crystal_retreat' },
        ],
      },
      purify_attempt: {
        speaker: 'You',
        portrait: '⚔️',
        text: 'You raise the Moonstone and Blessed Water, and begin chanting: "Light of moon and star of old, cleanse the darkness, break the hold..."',
        choices: [
          { text: '"By earth and sky, by flame and sea..."', next: 'purify_continue', condition: { type: 'has_item', itemId: 'blessed_water' } },
        ],
      },
      purify_continue: {
        speaker: 'The Corrupted Crystal',
        portrait: '💎',
        text: 'NO! STOP! I WILL NOT BE UNMADE! The crystal pulses violently, sending shockwaves through the chamber. Dark tendrils reach toward you, but the Moonstone glows brighter, shielding you!',
        effects: [{ type: 'damage', amount: 15 }],
        choices: [
          { text: '"AS IT WAS, SO LET IT BE!"', next: 'purify_success' },
        ],
      },
      purify_success: {
        speaker: 'Narrator',
        portrait: '✨',
        text: 'A blinding light erupts from the crystal! The darkness shatters like glass, dissolving into nothing. The crystal\'s color shifts from sickly purple to a brilliant, warm gold. The ground stops trembling. The air clears. You feel a wave of warmth and life energy wash over the land.\n\nThe Corrupted Crystal has been purified. Willowbrook is saved!',
        effects: [
          { type: 'set_flag', flag: 'crystal_purified' },
          { type: 'complete_quest', questId: 'purify_crystal' },
          { type: 'complete_quest', questId: 'find_ruins' },
          { type: 'complete_quest', questId: 'prepare_journey' },
          { type: 'add_xp', amount: 200 },
          { type: 'add_gold', amount: 100 },
          { type: 'heal', amount: 999 },
          { type: 'set_chapter', chapter: 2 },
          { type: 'remove_item', itemId: 'ancient_incantation', quantity: 1 },
          { type: 'remove_item', itemId: 'blessed_water', quantity: 1 },
        ],
        choices: [
          { text: 'I did it...', next: 'victory' },
        ],
      },
      victory: {
        speaker: 'Narrator',
        portrait: '✨',
        text: 'Congratulations, Hero! You have purified the Crystal and saved Willowbrook! The land will heal, the crops will grow again, and the villagers will live in peace.\n\nBut whispers remain of other corrupted crystals in distant lands... Perhaps your adventure is just beginning.\n\n--- THE END (Chapter 1) ---',
        effects: [
          { type: 'set_flag', flag: 'chapter1_complete' },
        ],
        choices: [
          { text: 'Return to Willowbrook as a hero.', next: null },
        ],
      },
      dark_ending: {
        speaker: 'Narrator',
        portrait: '💎',
        text: 'You accept the crystal\'s offer. Dark energy flows into you, filling you with terrible power. But as the darkness takes hold, you realize too late that you have become its puppet. Willowbrook falls into shadow, and the corruption spreads unchecked.\n\n--- BAD ENDING ---',
        effects: [
          { type: 'set_flag', flag: 'dark_ending' },
          { type: 'set_chapter', chapter: -1 },
        ],
        choices: [
          { text: 'Start a new game...', next: null },
        ],
      },
      crystal_retreat: {
        speaker: 'The Corrupted Crystal',
        portrait: '💎',
        text: 'Run, little mortal. Run back to your village. But know that every moment you delay, my power grows. The land withers. Your friends weaken. Time is not on your side.',
        effects: [{ type: 'damage', amount: 10 }],
        choices: [
          { text: 'I will return prepared.', next: null },
        ],
      },
    },
  },
};
