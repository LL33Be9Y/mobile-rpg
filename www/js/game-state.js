// Game State - manages player data, flags, inventory, quests
const GameState = (() => {
  const defaultState = {
    player: {
      name: 'Hero',
      level: 1,
      xp: 0,
      xpToNext: 100,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      gold: 50,
      attack: 12,
      defense: 8,
      magic: 10,
    },
    flags: {},           // story flags: { 'met_elder': true, 'saved_cat': true }
    inventory: [],       // [{ id, name, description, quantity, type }]
    quests: [],          // [{ id, name, description, status: 'active'|'completed', steps: [] }]
    relationships: {},   // { 'elder': 5, 'merchant': 3 }
    currentLocation: 'village_square',
    chapter: 1,
    playtime: 0,
    lastSaveTimestamp: 0,
  };

  let state = null;

  function init(savedState) {
    if (savedState) {
      state = { ...defaultState, ...savedState };
      // Merge nested objects
      state.player = { ...defaultState.player, ...(savedState.player || {}) };
    } else {
      state = JSON.parse(JSON.stringify(defaultState));
    }
  }

  function get() {
    return state;
  }

  function getPlayer() {
    return state.player;
  }

  function setFlag(flag, value) {
    state.flags[flag] = value !== undefined ? value : true;
  }

  function getFlag(flag) {
    return state.flags[flag];
  }

  function addItem(item) {
    const existing = state.inventory.find(i => i.id === item.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
      state.inventory.push({ ...item, quantity: item.quantity || 1 });
    }
  }

  function removeItem(itemId, quantity) {
    const idx = state.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    const item = state.inventory[idx];
    const removeQty = quantity || 1;
    item.quantity -= removeQty;
    if (item.quantity <= 0) {
      state.inventory.splice(idx, 1);
    }
    return true;
  }

  function hasItem(itemId, quantity) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return false;
    return item.quantity >= (quantity || 1);
  }

  function addQuest(quest) {
    if (state.quests.find(q => q.id === quest.id)) return;
    state.quests.push({ ...quest, status: 'active' });
  }

  function completeQuest(questId) {
    const quest = state.quests.find(q => q.id === questId);
    if (quest) quest.status = 'completed';
  }

  function isQuestActive(questId) {
    const quest = state.quests.find(q => q.id === questId);
    return quest && quest.status === 'active';
  }

  function isQuestCompleted(questId) {
    const quest = state.quests.find(q => q.id === questId);
    return quest && quest.status === 'completed';
  }

  function changeRelationship(npcId, amount) {
    state.relationships[npcId] = (state.relationships[npcId] || 0) + amount;
  }

  function getRelationship(npcId) {
    return state.relationships[npcId] || 0;
  }

  function addXp(amount) {
    state.player.xp += amount;
    let leveled = false;
    while (state.player.xp >= state.player.xpToNext) {
      state.player.xp -= state.player.xpToNext;
      state.player.level++;
      state.player.xpToNext = Math.floor(state.player.xpToNext * 1.5);
      state.player.maxHp += 10;
      state.player.hp = state.player.maxHp;
      state.player.maxMp += 5;
      state.player.mp = state.player.maxMp;
      state.player.attack += 2;
      state.player.defense += 2;
      state.player.magic += 2;
      leveled = true;
    }
    return leveled;
  }

  function addGold(amount) {
    state.player.gold += amount;
  }

  function setLocation(locationId) {
    state.currentLocation = locationId;
  }

  function applyEffect(effect) {
    switch (effect.type) {
      case 'set_flag':
        setFlag(effect.flag, effect.value);
        break;
      case 'add_item':
        addItem(effect.item);
        break;
      case 'remove_item':
        removeItem(effect.itemId, effect.quantity);
        break;
      case 'add_xp':
        addXp(effect.amount);
        break;
      case 'add_gold':
        addGold(effect.amount);
        break;
      case 'change_relationship':
        changeRelationship(effect.npcId, effect.amount);
        break;
      case 'add_quest':
        addQuest(effect.quest);
        break;
      case 'complete_quest':
        completeQuest(effect.questId);
        break;
      case 'heal':
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + effect.amount);
        break;
      case 'damage':
        state.player.hp = Math.max(0, state.player.hp - effect.amount);
        break;
      case 'set_location':
        setLocation(effect.location);
        break;
      case 'set_chapter':
        state.chapter = effect.chapter;
        break;
    }
  }

  function checkCondition(condition) {
    switch (condition.type) {
      case 'flag':
        return !!state.flags[condition.flag] === (condition.value !== undefined ? condition.value : true);
      case 'has_item':
        return hasItem(condition.itemId, condition.quantity);
      case 'no_item':
        return !hasItem(condition.itemId);
      case 'gold_gte':
        return state.player.gold >= condition.amount;
      case 'level_gte':
        return state.player.level >= condition.level;
      case 'relationship_gte':
        return getRelationship(condition.npcId) >= condition.amount;
      case 'quest_active':
        return isQuestActive(condition.questId);
      case 'quest_completed':
        return isQuestCompleted(condition.questId);
      case 'chapter':
        return state.chapter === condition.chapter;
      default:
        return true;
    }
  }

  function serialize() {
    return JSON.parse(JSON.stringify(state));
  }

  return {
    init, get, getPlayer, setFlag, getFlag, addItem, removeItem, hasItem,
    addQuest, completeQuest, isQuestActive, isQuestCompleted,
    changeRelationship, getRelationship, addXp, addGold, setLocation,
    applyEffect, checkCondition, serialize,
  };
})();
