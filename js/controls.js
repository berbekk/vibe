import { MODES, SYMMETRY_OPTIONS, PALETTES, DEFAULT_STATE } from './config.js';
import { canShareFiles } from './ios-share.js';
import { IosMotion } from './ios-motion.js';
import { isIos } from './ios-detect.js';

export class Controls {
  constructor(root, onChange) {
    this.root = root;
    this.onChange = onChange;
    this.state = { ...DEFAULT_STATE };
    this.refs = {};
    this.motion = null;
  }

  init() {
    this.refs.modeGrid = document.getElementById('mode-grid');
    this.refs.symmetryRow = document.getElementById('symmetry-row');
    this.refs.palette = document.getElementById('palette');
    this.refs.brushSize = document.getElementById('brush-size');
    this.refs.glowToggle = document.getElementById('glow-toggle');
    this.refs.rainbowToggle = document.getElementById('rainbow-toggle');
    this.refs.undoBtn = document.getElementById('undo-btn');
    this.refs.clearBtn = document.getElementById('clear-btn');
    this.refs.togglePanel = document.getElementById('toggle-panel');
    this.refs.panel = document.getElementById('panel');
    this.refs.iosSection = document.getElementById('ios-section');
    this.refs.motionToggle = document.getElementById('motion-toggle');
    this.refs.motionStatus = document.getElementById('motion-status');
    this.refs.shareBtn = document.getElementById('share-btn');

    this.renderModes();
    this.renderSymmetry();
    this.renderPalette();
    this.setupIosSection();
    this.bindEvents();
    this.emit();
  }

  setupIosSection() {
    const motionSupported = IosMotion.isSupported();
    const shareSupported = Boolean(navigator.share);

    if (!isIos() || (!motionSupported && !shareSupported)) {
      return;
    }

    this.refs.iosSection.hidden = false;

    if (!motionSupported) {
      this.refs.motionToggle.disabled = true;
      this.setMotionStatus('Гироскоп недоступен в этом браузере');
    }

    if (!shareSupported) {
      this.refs.shareBtn.hidden = true;
    } else if (!canShareFiles()) {
      this.refs.shareBtn.textContent = 'Поделиться ссылкой';
    }
  }

  setMotionStatus(message) {
    if (!message) {
      this.refs.motionStatus.hidden = true;
      this.refs.motionStatus.textContent = '';
      return;
    }

    this.refs.motionStatus.hidden = false;
    this.refs.motionStatus.textContent = message;
  }

  renderModes() {
    this.refs.modeGrid.innerHTML = MODES.map((mode) => `
      <button
        type="button"
        class="mode-btn${mode.id === this.state.mode ? ' mode-btn--active' : ''}"
        data-mode="${mode.id}"
      >${mode.label}</button>
    `).join('');
  }

  renderSymmetry() {
    this.refs.symmetryRow.innerHTML = SYMMETRY_OPTIONS.map((value) => `
      <button
        type="button"
        class="symmetry-btn${value === this.state.symmetry ? ' symmetry-btn--active' : ''}"
        data-symmetry="${value}"
      >${value}</button>
    `).join('');
  }

  renderPalette() {
    this.refs.palette.innerHTML = PALETTES.map((palette) => {
      const preview = palette.colors[0];
      const active = palette.id === this.state.paletteId ? ' palette-btn--active' : '';

      return `
        <button
          type="button"
          class="palette-btn${active}"
          data-palette="${palette.id}"
          style="background: ${preview}"
          aria-label="${palette.id}"
        ></button>
      `;
    }).join('');
  }

  bindEvents() {
    this.refs.modeGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mode]');
      if (!button) {
        return;
      }

      this.state.mode = button.dataset.mode;
      this.renderModes();
      this.emit();
    });

    this.refs.symmetryRow.addEventListener('click', (event) => {
      const button = event.target.closest('[data-symmetry]');
      if (!button) {
        return;
      }

      this.state.symmetry = Number(button.dataset.symmetry);
      this.renderSymmetry();
      this.emit();
    });

    this.refs.palette.addEventListener('click', (event) => {
      const button = event.target.closest('[data-palette]');
      if (!button) {
        return;
      }

      this.state.paletteId = button.dataset.palette;
      this.renderPalette();
      this.emit();
    });

    this.refs.brushSize.addEventListener('input', () => {
      this.state.brushSize = Number(this.refs.brushSize.value);
      this.emit();
    });

    this.refs.glowToggle.addEventListener('change', () => {
      this.state.glow = this.refs.glowToggle.checked;
      this.emit();
    });

    this.refs.rainbowToggle.addEventListener('change', () => {
      this.state.rainbow = this.refs.rainbowToggle.checked;
      this.emit();
    });

    this.refs.motionToggle.addEventListener('change', async () => {
      const enabled = this.refs.motionToggle.checked;
      this.state.motion = enabled;
      this.onChange({ type: 'motion-toggle', enabled });
    });

    this.refs.shareBtn.addEventListener('click', () => {
      this.onChange({ type: 'share' });
    });

    this.refs.togglePanel.addEventListener('click', () => {
      this.refs.panel.classList.toggle('panel--open');
    });

    this.refs.undoBtn.addEventListener('click', () => {
      this.onChange({ type: 'undo' });
    });

    this.refs.clearBtn.addEventListener('click', () => {
      this.onChange({ type: 'clear' });
    });
  }

  async enableMotion(motionController) {
    this.motion = motionController;
    const granted = await motionController.requestAccess();

    if (!granted) {
      this.refs.motionToggle.checked = false;
      this.state.motion = false;
      this.setMotionStatus('Нужно разрешить доступ к датчикам движения');
      return false;
    }

    this.setMotionStatus('Наклоняйте iPhone — паттерн вращается');
    return true;
  }

  disableMotion() {
    if (this.motion) {
      this.motion.stop();
    }

    this.setMotionStatus('');
  }

  emit() {
    this.onChange({ type: 'state', state: { ...this.state } });
  }

  getState() {
    return { ...this.state };
  }
}
