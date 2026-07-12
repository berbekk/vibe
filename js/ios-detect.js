export function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isStandalonePwa() {
  return window.navigator.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;
}
