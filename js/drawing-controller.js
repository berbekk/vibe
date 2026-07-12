import { getCanvasPoint, interpolatePoints } from './utils.js';

export class DrawingController {
  constructor(canvas, engine, colorEngine, getState) {
    this.canvas = canvas;
    this.engine = engine;
    this.colorEngine = colorEngine;
    this.getState = getState;
    this.isDrawing = false;
    this.hasStroke = false;
    this.lastPoint = null;
    this.onFirstStroke = null;
    this.onStrokeStart = null;
    this.onStrokeEnd = null;
    this.onCanvasTap = null;
  }

  bind() {
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
  }

  onTouchStart = (event) => {
    if (event.touches.length !== 1) {
      return;
    }

    event.preventDefault();
    this.isDrawing = true;
    this.hasStroke = false;

    const touch = event.touches[0];
    this.lastPoint = getCanvasPoint(this.canvas, touch.clientX, touch.clientY);
  };

  onTouchMove = (event) => {
    if (!this.isDrawing || event.touches.length !== 1) {
      return;
    }

    event.preventDefault();

    if (!this.hasStroke) {
      this.engine.saveState();
      this.hasStroke = true;

      if (this.onStrokeStart) {
        this.onStrokeStart();
      }

      if (this.onFirstStroke) {
        this.onFirstStroke();
      }
    }

    const touch = event.touches[0];
    const point = getCanvasPoint(this.canvas, touch.clientX, touch.clientY);
    const state = this.getState();
    const step = Math.max(2, state.brushSize * 0.35);
    const segments = interpolatePoints(this.lastPoint, point, step);

    segments.forEach((segmentPoint) => {
      const moveDistance = Math.hypot(
        segmentPoint.x - this.lastPoint.x,
        segmentPoint.y - this.lastPoint.y
      );
      const color = this.colorEngine.next(moveDistance);
      const stroke = [this.lastPoint, segmentPoint];

      this.engine.drawSegment(stroke, {
        mode: state.mode,
        symmetry: state.symmetry,
        color,
        brushSize: state.brushSize,
        glow: state.glow
      });

      this.lastPoint = segmentPoint;
    });
  };

  onTouchEnd = (event) => {
    if (!this.isDrawing) {
      return;
    }

    event.preventDefault();

    if (!this.hasStroke && this.onCanvasTap) {
      this.onCanvasTap();
    }

    if (this.hasStroke && this.onStrokeEnd) {
      this.onStrokeEnd();
    }

    this.isDrawing = false;
    this.hasStroke = false;
    this.lastPoint = null;
  };
}
