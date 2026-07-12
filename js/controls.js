import { MODES, SYMMETRY_OPTIONS, PALETTES, DEFAULT_STATE } from './config.js';
import { IosMotion } from './ios-motion.js';
import { isIos } from './ios-detect.js';

export class Controls {
  constructor(root, onChange) {
    this.root = root;
    this.onChange = onChange;
    this.state = { ...DEFAULT_STATE };
    this.refs = {};
    this.motion = null;
    this.activePopover = null;
  }

  init() {
    this.refs.chrome = document.getElementById('chrome');
    this.refs.modeGrid = document.getElementById('mode-grid');
    this.refs.symmetryRow = document.getElementById('symmetry-row');
    this.refs.palette = document.getElementById('palette');
    this.refs.brushSize = document.getElementById('brush-size');
    this.refs.brushSizeValue = document.getElementById('brush-size-value');
    this.refs.glowToggle = document.getElementById('glow-toggle');
    this.refs.rainbowToggle = document.getElementById('rainbow-toggle');
    this.refs.dockUndo = document.getElementById('dock-undo');
    this.refs.dockShare = document.getElementById('dock-share');
    this.refs.dockClear = document.getElementById('dock-clear');
    this.refs.btnSettings = document.getElementById('btn-settings');
    this.refs.motionToggle = document.getElementById('motion-toggle');
    this.refs.motionStatus = document.getElementById('motion-status');
    this.refs.popovers = {
      brush: document.getElementById('popover-brush'),
      mode: document.getElementById('popover-mode'),
      color: document.getElementById('popover-color'),
      symmetry: document.getElementById('popover-symmetry'),
      settings: document.getElementById('popover-settings')
    };

    this.renderModes();
    this.renderSymmetry();
    this.renderPalette();
    this.setupIosSection();
    this.bindEvents();
    this.emit();
  }

  setupIosSection() {
    if (!isIos()) {
      return;
    }

    document.documentElement.classList.add('ios');

    if (navigator.share) {
      this.refs.dockShare.hidden = false;
    }

    if (IosMotion.isSupported()) {
      this.refs.btnSettings.hidden = false;
    }
  }

  setChromeVisible(visible) {
    this.refs.chrome.classList.toggle('chrome--hidden', !visible);
  }

  closePopover() {
    Object.values(this.refs.popovers).forEach((node) => {
      node.hidden = true;
    });

    this.refs.chrome.querySelectorAll('.tool-btn--active').forEach((button) => {
      button.classList.remove('tool-btn--active');
    });

    this.activePopover = null;
  }

  openPopover(name, anchor) {
    if (this.activePopover === name) {
      this.closePopover();
      return;
    }

    this.closePopover();
    const popover = this.refs.popovers[name];
    if (!popover || !anchor) {
      return;
    }

    popover.hidden = false;
    anchor.classList.add('tool-btn--active');
    this.activePopover = name;

    const toolbar = anchor.closest('.toolbar');
    const toolbarRect = toolbar.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth;
    const left = Math.min(
      Math.max(anchorRect.left + anchorRect.width / 2 - popoverWidth / 2, 12),
      window.innerWidth - popoverWidth - 12
    );

    popover.style.top = `${toolbarRect.bottom + 8}px`;
    popover.style.left = `${left}px`;
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
        class="segmented__item${mode.id === this.state.mode ? ' segmented__item--active' : ''}"
        data-mode="${mode.id}"
      >${mode.label}</button>
    `).join('');
  }

  renderSymmetry() {
    this.refs.symmetryRow.innerHTML = SYMMETRY_OPTIONS.map((value) => `
      <button
        type="button"
        class="chip${value === this.state.symmetry ? ' chip--active' : ''}"
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
    this.refs.chrome.querySelectorAll('[data-popover]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const id = button.dataset.popover.replace('popover-', '');
        this.setChromeVisible(true);
        this.openPopover(id, button);
      });
    });

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
      this.refs.brushSizeValue.textContent = String(this.state.brushSize);
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

    this.refs.dockUndo.addEventListener('click', () => {
      this.onChange({ type: 'undo' });
    });

    this.refs.dockShare.addEventListener('click', () => {
      this.onChange({ type: 'share' });
    });

    this.refs.dockClear.addEventListener('click', () => {
      this.onChange({ type: 'clear' });
    });

    document.addEventListener('pointerdown', (event) => {
      if (!this.refs.chrome.contains(event.target)) {
        this.closePopover();
      }
    });
  }

  async enableMotion(motionController) {
    this.motion = motionController;
    const granted = await motionController.requestAccess();

    if (!granted) {
      this.refs.motionToggle.checked = false;
      this.state.motion = false;
      this.setMotionStatus('Разрешите доступ к датчикам движения.');
      return false;
    }

    this.setMotionStatus('Наклоняйте iPhone, чтобы вращать узор.');
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
