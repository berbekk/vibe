export class IosMotion {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.active = false;
    this.handleOrientation = this.handleOrientation.bind(this);
  }

  static isSupported() {
    return 'DeviceOrientationEvent' in window;
  }

  static needsPermission() {
    return typeof DeviceOrientationEvent.requestPermission === 'function';
  }

  async requestAccess() {
    if (!IosMotion.isSupported()) {
      return false;
    }

    if (IosMotion.needsPermission()) {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response !== 'granted') {
        return false;
      }
    }

    this.start();
    return true;
  }

  start() {
    if (this.active) {
      return;
    }

    window.addEventListener('deviceorientation', this.handleOrientation);
    this.active = true;
  }

  stop() {
    if (!this.active) {
      return;
    }

    window.removeEventListener('deviceorientation', this.handleOrientation);
    this.active = false;
    this.onUpdate({ rotation: 0, hueShift: 0 });
  }

  handleOrientation(event) {
    const gamma = event.gamma ?? 0;
    const beta = event.beta ?? 0;
    const rotation = (gamma / 90) * Math.PI * 0.45;
    const hueShift = (beta - 45) * 0.6;

    this.onUpdate({ rotation, hueShift });
  }
}
