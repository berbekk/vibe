import { PALETTES } from './config.js';

export class ColorEngine {
  constructor() {
    this.hue = Math.random() * 360;
    this.colorIndex = 0;
    this.palette = PALETTES[0].colors;
    this.rainbow = true;
    this.motionHueShift = 0;
  }

  setPalette(paletteId) {
    const palette = PALETTES.find((item) => item.id === paletteId);
    if (palette) {
      this.palette = palette.colors;
      this.colorIndex = 0;
    }
  }

  next(moveDistance) {
    this.hue = (this.hue + 1.5 + moveDistance * 0.08 + this.motionHueShift * 0.02) % 360;

    if (this.rainbow) {
      return `hsla(${this.hue}, 88%, 68%, 0.9)`;
    }

    const color = this.palette[this.colorIndex % this.palette.length];
    this.colorIndex += moveDistance > 2 ? 1 : 0;
    return color;
  }

  setRainbow(enabled) {
    this.rainbow = enabled;
  }

  setMotionHueShift(shift) {
    this.motionHueShift = shift;
  }
}
