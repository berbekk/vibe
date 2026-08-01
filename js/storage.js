import { STORAGE_KEY } from './data.js';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { checked: {}, openCategories: null };
    }
    const parsed = JSON.parse(raw);
    return {
      checked: parsed.checked && typeof parsed.checked === 'object' ? parsed.checked : {},
      openCategories:
        parsed.openCategories && typeof parsed.openCategories === 'object'
          ? parsed.openCategories
          : null,
    };
  } catch {
    return { checked: {}, openCategories: null };
  }
}

export function saveState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      checked: state.checked,
      openCategories: state.openCategories,
    })
  );
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
