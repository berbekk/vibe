import { CATEGORIES, PRIORITY_LABELS, getAllItems } from './data.js?v=5';
import { loadState, saveState, clearState } from './storage.js?v=5';
import { computeProgress, computeCategoryProgress } from './progress.js?v=5';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'todo', label: 'Осталось' },
  { id: 'critical', label: 'Критично' },
  { id: 'done', label: 'Готово' },
];

const state = {
  checked: {},
  activeTab: CATEGORIES[0].id,
  filter: 'all',
};

const els = {
  topbar: document.querySelector('#topbar'),
  sectionTabs: document.querySelector('#section-tabs'),
  checklist: document.querySelector('#checklist'),
  filters: document.querySelector('#filters'),
  progressFill: document.querySelector('#progress-fill'),
  progressValue: document.querySelector('#progress-value'),
  progressMeta: document.querySelector('#progress-meta'),
  resetBtn: document.querySelector('#reset-btn'),
  toast: document.querySelector('#toast'),
};

let toastTimer = 0;

function initState() {
  const saved = loadState();
  state.checked = { ...saved.checked };

  const savedTabExists = CATEGORIES.some((category) => category.id === saved.activeTab);
  state.activeTab = savedTabExists ? saved.activeTab : CATEGORIES[0].id;
}

function persist() {
  saveState({
    checked: state.checked,
    activeTab: state.activeTab,
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

function getActiveCategory() {
  return CATEGORIES.find((category) => category.id === state.activeTab) || CATEGORIES[0];
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
    <span>${progress.done} из ${progress.total}</span>
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

function renderSectionTabs() {
  els.sectionTabs.innerHTML = CATEGORIES.map((category) => {
    const progress = computeCategoryProgress(category, state.checked);
    const isActive = category.id === state.activeTab;

    return `
      <button
        type="button"
        class="section-tab${isActive ? ' is-active' : ''}"
        data-tab="${category.id}"
        aria-selected="${isActive}"
      >
        <span class="section-tab__label">${escapeHtml(category.shortTitle)}</span>
        <span class="section-tab__count">${progress.done}/${progress.total}</span>
      </button>
    `;
  }).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function tipLinkHtml(link) {
  if (!link?.href || !link?.label) {
    return '';
  }

  return `
    <a
      class="item__link"
      href="${escapeHtml(link.href)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      ${escapeHtml(link.label)}
    </a>
  `;
}

function itemTemplate(item) {
  const checked = Boolean(state.checked[item.id]);
  const tipId = `tip-${item.id}`;

  return `
    <article class="item${checked ? ' is-checked' : ''}" data-item-id="${item.id}">
      <label class="item__check">
        <input type="checkbox" ${checked ? 'checked' : ''} data-check="${item.id}" aria-label="${escapeHtml(item.title)}">
        <span class="item__box" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3.5 8.2 6.6 11.2 12.5 4.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </label>
      <div class="item__content">
        <div class="item__top">
          <h3 class="item__title">${escapeHtml(item.title)}</h3>
          <span class="badge badge--${item.priority}">${PRIORITY_LABELS[item.priority]}</span>
        </div>
        <button type="button" class="item__toggle-tip" data-tip-toggle="${tipId}" aria-expanded="false">
          Зачем это важно
        </button>
        <div class="item__tip" id="${tipId}" hidden>
          <p>${escapeHtml(item.tip)}</p>
          ${tipLinkHtml(item.link)}
        </div>
      </div>
    </article>
  `;
}

function renderChecklist() {
  const category = getActiveCategory();
  const visibleItems = category.items.filter(matchesFilter);
  const progress = computeCategoryProgress(category, state.checked);

  if (visibleItems.length === 0) {
    els.checklist.innerHTML = `
      <section class="panel">
        <header class="panel__header">
          <div>
            <h2 class="panel__title">${escapeHtml(category.title)}</h2>
            <p class="panel__hint">${escapeHtml(category.hint)}</p>
          </div>
          <span class="panel__count">${progress.done}/${progress.total}</span>
        </header>
        <div class="empty-state">
          <h3>По этому фильтру пусто</h3>
          <p>Смените фильтр или вкладку, чтобы снова увидеть пункты.</p>
        </div>
      </section>
    `;
    return;
  }

  els.checklist.innerHTML = `
    <section class="panel">
      <header class="panel__header">
        <div>
          <h2 class="panel__title">${escapeHtml(category.title)}</h2>
          <p class="panel__hint">${escapeHtml(category.hint)}</p>
        </div>
        <span class="panel__count">${progress.done}/${progress.total}</span>
      </header>
      <div class="panel__list">
        ${visibleItems.map(itemTemplate).join('')}
      </div>
    </section>
  `;
}

function render() {
  renderSectionTabs();
  renderFilters();
  updateProgress();
  renderChecklist();
}

function setActiveTab(tabId) {
  if (!CATEGORIES.some((category) => category.id === tabId)) {
    return;
  }
  state.activeTab = tabId;
  persist();
  render();
}

function setChecked(itemId, value) {
  if (value) {
    state.checked[itemId] = true;
  } else {
    delete state.checked[itemId];
  }
  persist();
  updateProgress();
  renderSectionTabs();

  const itemEl = els.checklist.querySelector(`[data-item-id="${itemId}"]`);
  if (itemEl) {
    itemEl.classList.toggle('is-checked', value);
  }

  const category = getActiveCategory();
  const progress = computeCategoryProgress(category, state.checked);
  const countEl = els.checklist.querySelector('.panel__count');
  if (countEl) {
    countEl.textContent = `${progress.done}/${progress.total}`;
  }
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
  els.sectionTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tab]');
    if (!button) return;
    setActiveTab(button.dataset.tab);
  });

  els.filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    state.filter = button.dataset.filter;
    renderFilters();
    renderChecklist();
  });

  els.checklist.addEventListener('click', (event) => {
    const tipBtn = event.target.closest('[data-tip-toggle]');
    if (!tipBtn) return;

    const tip = document.getElementById(tipBtn.dataset.tipToggle);
    if (!tip) return;

    const willOpen = tip.hasAttribute('hidden');
    tip.toggleAttribute('hidden', !willOpen);
    tipBtn.setAttribute('aria-expanded', String(willOpen));
    tipBtn.textContent = willOpen ? 'Скрыть подсказку' : 'Зачем это важно';
  });

  els.checklist.addEventListener('change', (event) => {
    const input = event.target.closest('[data-check]');
    if (!input) return;
    setChecked(input.dataset.check, input.checked);
  });

  els.resetBtn.addEventListener('click', resetProgress);

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
  getAllItems();
}

bootstrap();
