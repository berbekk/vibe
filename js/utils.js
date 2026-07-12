import { MOBILE_MAX_WIDTH } from './config.js';

export function isMobileDevice() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
}

export function getCanvasPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

export function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

export function interpolatePoints(from, to, step) {
  const dist = distance(from, to);
  if (dist <= step) {
    return [to];
  }

  const points = [];
  const count = Math.ceil(dist / step);

  for (let i = 1; i <= count; i += 1) {
    const t = i / count;
    points.push({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t
    });
  }

  return points;
}
