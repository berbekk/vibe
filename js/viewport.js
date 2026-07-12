export function bindVisualViewport(onChange) {
  const update = () => {
    const viewport = window.visualViewport;

    if (viewport) {
      document.documentElement.style.setProperty('--app-height', `${viewport.height}px`);
      document.documentElement.style.setProperty('--viewport-offset-top', `${viewport.offsetTop}px`);
    } else {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
      document.documentElement.style.setProperty('--viewport-offset-top', '0px');
    }

    onChange();
  };

  update();

  window.visualViewport?.addEventListener('resize', update);
  window.visualViewport?.addEventListener('scroll', update);
  window.addEventListener('orientationchange', update);
  window.addEventListener('resize', update);

  return update;
}
