import { STORAGE_KEY } from './data.js?v=5';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { checked: {}, activeTab: null };
    }
    const parsed = JSON.parse(raw);
    return {
      checked: parsed.checked && typeof parsed.checked === 'object' ? parsed.checked : {},
      activeTab: typeof parsed.activeTab === 'string' ? parsed.activeTab : null,
    };
  } catch {
    return { checked: {}, activeTab: null };
  }
}

export function saveState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      checked: state.checked,
      activeTab: state.activeTab,
    })
  );
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
