export const MODES = [
  { id: 'kaleidoscope', label: 'Калейдоскоп' },
  { id: 'mandala', label: 'Мандала' },
  { id: 'mirror', label: 'Зеркало' },
  { id: 'flow', label: 'Поток' }
];

export const SYMMETRY_OPTIONS = [2, 4, 6, 8, 12, 16];

export const PALETTES = [
  { id: 'aurora', colors: ['#a855f7', '#6366f1', '#22d3ee', '#f472b6'] },
  { id: 'sunset', colors: ['#f97316', '#ef4444', '#fbbf24', '#ec4899'] },
  { id: 'ocean', colors: ['#06b6d4', '#3b82f6', '#14b8a6', '#8b5cf6'] },
  { id: 'neon', colors: ['#22c55e', '#eab308', '#f43f5e', '#06b6d4'] },
  { id: 'mono', colors: ['#ffffff', '#c4b5fd', '#93c5fd', '#fda4af'] }
];

export const MAX_UNDO = 15;

export const MOBILE_MAX_WIDTH = 767;

export const DEFAULT_STATE = {
  mode: 'kaleidoscope',
  symmetry: 8,
  paletteId: 'aurora',
  brushSize: 8,
  glow: true,
  rainbow: true
};
