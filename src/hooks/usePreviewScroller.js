import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScrollPerf } from '../utils/scrollPerf';

export default function usePreviewScroller(showPhoneFrame, previewScreen) {
  useEffect(() => {
    if (!showPhoneFrame || !previewScreen) return undefined;

    ScrollTrigger.scrollerProxy(previewScreen, {
      scrollTop(value) {
        if (arguments.length) {
          previewScreen.scrollTop = value;
        }
        return previewScreen.scrollTop;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: previewScreen.clientWidth,
          height: previewScreen.clientHeight,
        };
      },
    });

    ScrollTrigger.defaults({ scroller: previewScreen });

    const refresh = () => ScrollTrigger.refresh();
    previewScreen.addEventListener('scroll', refresh, { passive: true });
    window.addEventListener('resize', refresh);

    const cleanupScrollPerf = initScrollPerf(previewScreen);
    refresh();
    window.dispatchEvent(new Event('resize'));

    return () => {
      previewScreen.removeEventListener('scroll', refresh);
      window.removeEventListener('resize', refresh);
      cleanupScrollPerf();
      ScrollTrigger.scrollerProxy(previewScreen, null);
      ScrollTrigger.defaults({ scroller: window });
      refresh();
    };
  }, [showPhoneFrame, previewScreen]);
}
