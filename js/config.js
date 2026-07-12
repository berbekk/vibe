export const MODES = [
  { id: 'kaleidoscope', label: 'Калейдоскоп' },
  { id: 'mandala', label: 'Мандала' },
  { id: 'mirror', label: 'Зеркало' },
  { id: 'flow', label: 'Поток' }
];

export const SYMMETRY_OPTIONS = [2, 4, 6, 8, 12, 16];

export const PALETTES = [
  { id: 'system', colors: ['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2'] },
  { id: 'pastel', colors: ['#64D2FF', '#AC8E68', '#FF6482', '#DA8FFF'] },
  { id: 'mono', colors: ['#FFFFFF', '#AEAEB2', '#636366', '#48484A'] },
  { id: 'warm', colors: ['#FF9F0A', '#FF453A', '#FFD60A', '#FF6482'] },
  { id: 'cool', colors: ['#0A84FF', '#64D2FF', '#5E5CE6', '#30D158'] }
];

export const MAX_UNDO = 15;

export const MOBILE_MAX_WIDTH = 767;

export const DEFAULT_STATE = {
  mode: 'kaleidoscope',
  symmetry: 8,
  paletteId: 'system',
  brushSize: 8,
  glow: true,
  rainbow: true,
  motion: false
};
