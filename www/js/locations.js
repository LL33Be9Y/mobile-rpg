// Locations - defines all game areas with NPCs and navigation
const Locations = {
  village_square: {
    id: 'village_square',
    name: 'Village Square',
    description: 'The heart of Willowbrook village. A stone fountain gurgles in the center, surrounded by cobblestone paths. Villagers go about their daily routines.',
    bgColor: '#4a7c59',
    npcs: ['elder_rowan', 'merchant_tessa'],
    exits: [
      { to: 'forest_path', label: 'Forest Path', icon: '🌲' },
      { to: 'tavern', label: 'The Rusty Flagon', icon: '🍺' },
      { to: 'blacksmith', label: 'Blacksmith', icon: '⚒️' },
    ],
  },
  tavern: {
    id: 'tavern',
    name: 'The Rusty Flagon',
    description: 'A warm, dimly lit tavern. The smell of roasted meat and ale fills the air. A bard strums quietly in the corner.',
    bgColor: '#8b6914',
    npcs: ['bard_lyra', 'stranger_kael'],
    exits: [
      { to: 'village_square', label: 'Village Square', icon: '🏘️' },
    ],
  },
  blacksmith: {
    id: 'blacksmith',
    name: "Forge & Anvil",
    description: 'Heat radiates from the forge. Weapons and armor line the walls. The rhythmic clang of hammer on steel echoes through the shop.',
    bgColor: '#8b4513',
    npcs: ['blacksmith_gorn'],
    exits: [
      { to: 'village_square', label: 'Village Square', icon: '🏘️' },
    ],
  },
  forest_path: {
    id: 'forest_path',
    name: 'Whispering Woods',
    description: 'Tall oaks form a canopy overhead, filtering sunlight into dancing patterns. Strange whispers seem to come from deep within the trees.',
    bgColor: '#2d5a27',
    npcs: ['fairy_pip'],
    exits: [
      { to: 'village_square', label: 'Village Square', icon: '🏘️' },
      { to: 'ancient_ruins', label: 'Ancient Ruins', icon: '🏛️', condition: { type: 'flag', flag: 'knows_ruins_location' } },
    ],
  },
  ancient_ruins: {
    id: 'ancient_ruins',
    name: 'Ancient Ruins',
    description: 'Crumbling stone pillars rise from the overgrown ground. Strange runes glow faintly on the remaining walls. An ominous energy pulses from deeper within.',
    bgColor: '#4a4a6a',
    npcs: ['shadow_figure'],
    exits: [
      { to: 'forest_path', label: 'Whispering Woods', icon: '🌲' },
      { to: 'crystal_chamber', label: 'Crystal Chamber', icon: '💎', condition: { type: 'has_item', itemId: 'ancient_key' } },
    ],
  },
  crystal_chamber: {
    id: 'crystal_chamber',
    name: 'Crystal Chamber',
    description: 'A vast underground chamber filled with luminescent crystals. In the center, a massive crystal pulses with dark energy. This is the source of the corruption threatening the land.',
    bgColor: '#2a1a4a',
    npcs: ['dark_crystal'],
    exits: [
      { to: 'ancient_ruins', label: 'Ancient Ruins', icon: '🏛️' },
    ],
  },
};
