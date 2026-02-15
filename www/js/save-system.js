// Save System - localStorage for web, compatible with Cordova file storage
const SaveSystem = (() => {
  const SAVE_KEY = 'mobile_rpg_save';
  const SETTINGS_KEY = 'mobile_rpg_settings';

  function save(gameState) {
    const data = {
      version: 1,
      timestamp: Date.now(),
      state: gameState,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.state || null;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Settings save failed:', e);
    }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  return { save, load, deleteSave, hasSave, saveSettings, loadSettings };
})();
