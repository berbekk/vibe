import { isMobileDevice } from './utils.js';
import { CanvasEngine } from './canvas-engine.js';
import { ColorEngine } from './color-engine.js';
import { DrawingController } from './drawing-controller.js';
import { Controls } from './controls.js';

function showMobileApp() {
  document.getElementById('desktop-warning').hidden = true;
  document.getElementById('app').hidden = false;
}

function showDesktopWarning() {
  document.getElementById('desktop-warning').hidden = false;
  document.getElementById('app').hidden = true;
}

function initApp() {
  const canvas = document.getElementById('canvas');
  const hint = document.getElementById('hint');
  const engine = new CanvasEngine(canvas);
  const colorEngine = new ColorEngine();
  const controls = new Controls(document.getElementById('app'), (event) => {
    if (event.type === 'undo') {
      engine.undo();
      return;
    }

    if (event.type === 'clear') {
      engine.clear();
      return;
    }

    if (event.type === 'state') {
      colorEngine.setPalette(event.state.paletteId);
      colorEngine.setRainbow(event.state.rainbow);
    }
  });

  controls.init();

  const drawing = new DrawingController(
    canvas,
    engine,
    colorEngine,
    () => controls.getState()
  );

  drawing.onFirstStroke = () => {
    hint.classList.add('hint--hidden');
  };

  drawing.bind();

  const resize = () => engine.resize();
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
}

function boot() {
  if (isMobileDevice()) {
    showMobileApp();
    initApp();
  } else {
    showDesktopWarning();

    window.matchMedia('(max-width: 767px)').addEventListener('change', (event) => {
      if (event.matches) {
        location.reload();
      }
    });
  }
}

boot();
