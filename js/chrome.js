export function bindChromeAutoHide(chrome, drawingController) {
  let hideTimer = null;

  const show = () => {
    chrome.classList.remove('chrome--hidden');
    clearTimeout(hideTimer);
  };

  const scheduleHide = () => {
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      chrome.classList.add('chrome--hidden');
    }, 1400);
  };

  drawingController.onStrokeStart = () => {
    chrome.classList.add('chrome--hidden');
    clearTimeout(hideTimer);
  };

  drawingController.onStrokeEnd = () => {
    scheduleHide();
  };

  drawingController.onCanvasTap = () => {
    if (chrome.classList.contains('chrome--hidden')) {
      show();
    } else {
      chrome.classList.add('chrome--hidden');
    }
  };

  scheduleHide();
}
