export class CanvasEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.center = { x: 0, y: 0 };
    this.undoStack = [];
    this.motionOffset = 0;
    this.hasDrawing = false;
    this.displayWidth = 0;
    this.displayHeight = 0;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = this.canvas.getBoundingClientRect();
    const nextWidth = Math.floor(rect.width * dpr);
    const nextHeight = Math.floor(rect.height * dpr);
    const snapshot = this.captureSnapshot();

    this.canvas.width = nextWidth;
    this.canvas.height = nextHeight;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
    this.center = {
      x: rect.width / 2,
      y: rect.height / 2
    };

    if (snapshot) {
      this.ctx.drawImage(snapshot, 0, 0, rect.width, rect.height);
      return;
    }

    this.paintBackground(rect.width, rect.height);
  }

  captureSnapshot() {
    if (!this.hasDrawing || this.canvas.width === 0 || this.canvas.height === 0) {
      return null;
    }

    const snapshot = document.createElement('canvas');
    snapshot.width = this.canvas.width;
    snapshot.height = this.canvas.height;
    snapshot.getContext('2d').drawImage(this.canvas, 0, 0);
    return snapshot;
  }

  paintBackground(width, height) {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, width, height);
    this.hasDrawing = false;
  }

  saveState() {
    const snapshot = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.undoStack.push(snapshot);

    if (this.undoStack.length > 15) {
      this.undoStack.shift();
    }
  }

  undo() {
    const snapshot = this.undoStack.pop();
    if (!snapshot) {
      return false;
    }

    this.ctx.putImageData(snapshot, 0, 0);
    this.hasDrawing = this.undoStack.length > 0;
    return true;
  }

  clear() {
    const rect = this.canvas.getBoundingClientRect();
    this.undoStack = [];
    this.paintBackground(rect.width, rect.height);
  }

  setMotionOffset(offset) {
    this.motionOffset = offset;
  }

  toBlob() {
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, 'image/png');
    });
  }

  drawSegment(points, options) {
    const { mode, symmetry, color, brushSize, glow } = options;
    const segments = mode === 'flow' ? 1 : symmetry;

    for (let i = 0; i < segments; i += 1) {
      const angle = (Math.PI * 2 / segments) * i + this.motionOffset;

      this.ctx.save();
      this.applyTransform(angle, false, mode);
      this.strokePath(points, color, brushSize, glow);
      this.ctx.restore();

      if (mode === 'mandala' || mode === 'kaleidoscope') {
        this.ctx.save();
        this.applyTransform(angle, true, mode);
        this.strokePath(points, color, brushSize, glow);
        this.ctx.restore();
      }

      if (mode === 'mirror') {
        this.ctx.save();
        this.applyTransform(angle, true, 'mirror');
        this.strokePath(points, color, brushSize, glow);
        this.ctx.restore();
      }
    }

    this.hasDrawing = true;
  }

  applyTransform(angle, mirror, mode) {
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.rotate(angle);

    if (mirror) {
      if (mode === 'mirror') {
        this.ctx.scale(-1, 1);
      } else {
        this.ctx.scale(1, -1);
      }
    }

    this.ctx.translate(-this.center.x, -this.center.y);
  }

  strokePath(points, color, brushSize, glow) {
    if (points.length < 2) {
      return;
    }

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = brushSize;
    this.ctx.strokeStyle = color;

    if (glow) {
      this.ctx.shadowBlur = brushSize * 1.6;
      this.ctx.shadowColor = color;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i += 1) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    this.ctx.stroke();
    this.ctx.restore();
  }
}
