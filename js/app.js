import { CATEGORIES, PRIORITY_LABELS, getAllItems } from './data.js';
import { loadState, saveState, clearState } from './storage.js';
import { computeProgress, computeCategoryProgress } from './progress.js';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'todo', label: 'Осталось' },
  { id: 'critical', label: 'Критично' },
  { id: 'done', label: 'Готово' },
];

const state = {
  checked: {},
  openCategories: {},
  filter: 'all',
};

const els = {
  topbar: document.querySelector('#topbar'),
  checklist: document.querySelector('#checklist'),
  filters: document.querySelector('#filters'),
  progressFill: document.querySelector('#progress-fill'),
  progressValue: document.querySelector('#progress-value'),
  progressMeta: document.querySelector('#progress-meta'),
  resetBtn: document.querySelector('#reset-btn'),
  scrollBtn: document.querySelector('#scroll-checklist'),
  toast: document.querySelector('#toast'),
};

let toastTimer = 0;

function initState() {
  const saved = loadState();
  state.checked = { ...saved.checked };

  if (saved.openCategories) {
    state.openCategories = { ...saved.openCategories };
  } else {
    state.openCategories = Object.fromEntries(
      CATEGORIES.map((category, index) => [category.id, index === 0])
    );
  }
}

function persist() {
  saveState({
    checked: state.checked,
    openCategories: state.openCategories,
  });
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove('is-visible');
  }, 2200);
}

function matchesFilter(item) {
  const isChecked = Boolean(state.checked[item.id]);
  switch (state.filter) {
    case 'todo':
      return !isChecked;
    case 'done':
      return isChecked;
    case 'critical':
      return item.priority === 'critical';
    default:
      return true;
  }
}

function updateProgress() {
  const progress = computeProgress(state.checked);
  els.progressFill.style.width = `${progress.percent}%`;
  els.progressValue.textContent = `${progress.percent}%`;
  els.progressMeta.innerHTML = `
    <span>${progress.done} из ${progress.total} пунктов</span>
    <span>Критичных: ${progress.criticalDone}/${progress.criticalTotal}</span>
    <span>Осталось: ${progress.remaining}</span>
  `;
}

function renderFilters() {
  els.filters.innerHTML = FILTERS.map(
    (filter) => `
      <button
        type="button"
        class="filter-chip${state.filter === filter.id ? ' is-active' : ''}"
        data-filter="${filter.id}"
      >
        ${filter.label}
      </button>
    `
  ).join('');
}

function itemTemplate(item) {
  const checked = Boolean(state.checked[item.id]);
  const tipId = `tip-${item.id}`;

  return `
    <article class="item${checked ? ' is-checked' : ''}" data-item-id="${item.id}">
      <label class="item__check">
        <input type="checkbox" ${checked ? 'checked' : ''} data-check="${item.id}" aria-label="${item.title}">
        <span class="item__box" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3.5 8.2 6.6 11.2 12.5 4.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </label>
      <div class="item__content">
        <div class="item__top">
          <h3 class="item__title">${item.title}</h3>
          <span class="badge badge--${item.priority}">${PRIORITY_LABELS[item.priority]}</span>
        </div>
        <button type="button" class="item__toggle-tip" data-tip-toggle="${tipId}" aria-expanded="false">
          Зачем это важно
        </button>
        <p class="item__tip" id="${tipId}" hidden>${item.tip}</p>
      </div>
    </article>
  `;
}

function renderChecklist() {
  const fragments = CATEGORIES.map((category, index) => {
    const visibleItems = category.items.filter(matchesFilter);
    if (visibleItems.length === 0) {
      return '';
    }

    const catProgress = computeCategoryProgress(category, state.checked);
    const isOpen = Boolean(state.openCategories[category.id]);

    return `
      <section
        class="category${isOpen ? ' is-open' : ''}"
        data-category="${category.id}"
        style="animation-delay: ${120 + index * 40}ms"
      >
        <button type="button" class="category__header" data-toggle-category="${category.id}" aria-expanded="${isOpen}">
          <div class="category__title-wrap">
            <h2 class="category__title">${category.title}</h2>
            <p class="category__hint">${category.hint}</p>
          </div>
          <div class="category__stats">
            <span>${catProgress.done}/${catProgress.total}</span>
            <div class="category__mini" aria-hidden="true">
              <div class="category__mini-fill" style="width: ${catProgress.percent}%"></div>
            </div>
            <svg class="category__chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
        <div class="category__body">
          ${visibleItems.map(itemTemplate).join('')}
        </div>
      </section>
    `;
  }).join('');

  if (!fragments.trim()) {
    els.checklist.innerHTML = `
      <div class="empty-state">
        <h2>По этому фильтру пусто</h2>
        <p>Смените фильтр или снимите отметки, чтобы снова увидеть пункты.</p>
      </div>
    `;
    return;
  }

  els.checklist.innerHTML = fragments;
}

function render() {
  renderFilters();
  updateProgress();
  renderChecklist();
}

function toggleCategory(categoryId) {
  state.openCategories[categoryId] = !state.openCategories[categoryId];
  persist();
  renderChecklist();
}

function setChecked(itemId, value) {
  if (value) {
    state.checked[itemId] = true;
  } else {
    delete state.checked[itemId];
  }
  persist();
  updateProgress();

  const itemEl = els.checklist.querySelector(`[data-item-id="${itemId}"]`);
  if (itemEl) {
    itemEl.classList.toggle('is-checked', value);
  }

  // Refresh category counters without collapsing tip states awkwardly
  renderChecklist();
}

function resetProgress() {
  const done = Object.keys(state.checked).length;
  if (done === 0) {
    showToast('Пока отмечать нечего');
    return;
  }

  const confirmed = window.confirm('Сбросить все отметки чеклиста?');
  if (!confirmed) {
    return;
  }

  state.checked = {};
  clearState();
  persist();
  render();
  showToast('Прогресс сброшен');
}

function bindEvents() {
  els.filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    state.filter = button.dataset.filter;
    render();
  });

  els.checklist.addEventListener('click', (event) => {
    const categoryBtn = event.target.closest('[data-toggle-category]');
    if (categoryBtn) {
      toggleCategory(categoryBtn.dataset.toggleCategory);
      return;
    }

    const tipBtn = event.target.closest('[data-tip-toggle]');
    if (tipBtn) {
      const tip = document.getElementById(tipBtn.dataset.tipToggle);
      if (!tip) return;
      const willOpen = tip.hasAttribute('hidden');
      tip.toggleAttribute('hidden', !willOpen);
      tipBtn.setAttribute('aria-expanded', String(willOpen));
      tipBtn.textContent = willOpen ? 'Скрыть подсказку' : 'Зачем это важно';
    }
  });

  els.checklist.addEventListener('change', (event) => {
    const input = event.target.closest('[data-check]');
    if (!input) return;
    setChecked(input.dataset.check, input.checked);
  });

  els.resetBtn.addEventListener('click', resetProgress);

  els.scrollBtn.addEventListener('click', () => {
    document.querySelector('#checklist-anchor')?.scrollIntoView({ behavior: 'smooth' });
  });

  window.addEventListener(
    'scroll',
    () => {
      els.topbar.classList.toggle('is-scrolled', window.scrollY > 8);
    },
    { passive: true }
  );
}

function bootstrap() {
  initState();
  bindEvents();
  render();

  // Prefetch count for accessibility live region updates
  getAllItems();
}

bootstrap();
