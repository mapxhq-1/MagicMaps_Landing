let scrollEndTimer = null;
let isScrolling = false;
const listeners = new Set();

function notify() {
  document.documentElement.toggleAttribute('data-scrolling', isScrolling);
  listeners.forEach((fn) => fn(isScrolling));
}

export function subscribeScrollPerf(callback) {
  listeners.add(callback);
  callback(isScrolling);
  return () => listeners.delete(callback);
}

export function initScrollPerf() {
  const markScrolling = () => {
    if (!isScrolling) {
      isScrolling = true;
      notify();
    }
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      isScrolling = false;
      notify();
    }, 180);
  };

  window.addEventListener('wheel', markScrolling, { passive: true });
  window.addEventListener('touchmove', markScrolling, { passive: true });
  window.addEventListener('scroll', markScrolling, { passive: true });

  return () => {
    clearTimeout(scrollEndTimer);
    window.removeEventListener('wheel', markScrolling);
    window.removeEventListener('touchmove', markScrolling);
    window.removeEventListener('scroll', markScrolling);
    isScrolling = false;
    notify();
  };
}
