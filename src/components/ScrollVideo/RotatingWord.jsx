import { useEffect, useLayoutEffect, useRef } from 'react';
import HandDrawnUnderline from './HandDrawnUnderline';
import styles from './ScrollVideo.module.css';

const TRANSITION_OPTIONS = {
  duration: 200,
  easing: 'ease-in-out',
  fill: 'both',
};

const UNDERLINE_DRAW_OPTIONS = {
  duration: 280,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  fill: 'both',
};

const UNDERLINE_SETTLE_DELAY = 180;

function syncUnderlineWidth(word, underline) {
  if (!word || !underline) return;
  underline.style.width = `${Math.ceil(word.getBoundingClientRect().width)}px`;
}

function cancelUnderlineAnimations(underline) {
  if (!underline) return;
  underline.getAnimations().forEach((animation) => animation.cancel());
  underline.querySelectorAll('path').forEach((path) => {
    path.getAnimations().forEach((animation) => animation.cancel());
  });
}

function drawUnderline(underline) {
  if (!underline) return;
  cancelUnderlineAnimations(underline);
  underline.style.opacity = '1';

  underline.querySelectorAll('path').forEach((path, index) => {
    const animation = path.animate(
      [
        { transform: 'scaleX(0)' },
        { transform: 'scaleX(1)' },
      ],
      { ...UNDERLINE_DRAW_OPTIONS, delay: index * 35 },
    );

    animation.finished
      .then(() => animation.cancel())
      .catch(() => {});
  });
}

export default function RotatingWord({
  words,
  interval = 2900,
}) {
  const wordRef = useRef(null);
  const underlineRef = useRef(null);

  useLayoutEffect(() => {
    const word = wordRef.current;
    const underline = underlineRef?.current;
    if (!word || !underline) return undefined;

    let disposed = false;
    underline.style.opacity = '0';
    syncUnderlineWidth(word, underline);

    let initialDrawFrame = null;

    const drawWhenVisible = () => {
      initialDrawFrame = requestAnimationFrame(() => {
        if (!disposed) drawUnderline(underline);
      });
    };

    let visibilityObserver = null;
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          drawWhenVisible();
          visibilityObserver.disconnect();
        },
        { threshold: 0.25 },
      );
      visibilityObserver.observe(word);
    } else {
      drawWhenVisible();
    }

    const syncWidth = () => syncUnderlineWidth(word, underline);
    const resizeObserver = 'ResizeObserver' in window
      ? new ResizeObserver(syncWidth)
      : null;

    if (resizeObserver) resizeObserver.observe(word);
    else window.addEventListener('resize', syncWidth);

    document.fonts?.ready.then(() => {
      if (!disposed) syncWidth();
    });

    return () => {
      disposed = true;
      if (initialDrawFrame != null) cancelAnimationFrame(initialDrawFrame);
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', syncWidth);
      cancelUnderlineAnimations(underline);
    };
  }, []);

  useEffect(() => {
    const node = wordRef.current;
    if (!node || words.length < 2) return undefined;
    const underline = underlineRef.current;

    let wordIndex = 0;
    let disposed = false;
    let currentAnimation = null;
    let currentUnderlineAnimation = null;
    let rotationToken = 0;

    const rotate = async () => {
      const token = ++rotationToken;

      if (underline) {
        currentUnderlineAnimation = underline.animate(
          [
            { opacity: 1 },
            { opacity: 0 },
          ],
          { duration: 140, easing: 'ease-in-out', fill: 'both' },
        );
      }

      currentAnimation = node.animate(
        [
          { opacity: 1 },
          { opacity: 0 },
        ],
        TRANSITION_OPTIONS,
      );

      try {
        await currentAnimation.finished;
      } catch {
        return;
      }

      if (disposed || token !== rotationToken) return;
      currentAnimation.cancel();
      currentUnderlineAnimation?.cancel();
      currentUnderlineAnimation = null;
      if (underline) underline.style.opacity = '0';

      wordIndex = (wordIndex + 1) % words.length;
      node.textContent = words[wordIndex];
      syncUnderlineWidth(node, underline);

      currentAnimation = node.animate(
        [
          { opacity: 0 },
          { opacity: 1 },
        ],
        TRANSITION_OPTIONS,
      );

      try {
        await currentAnimation.finished;
      } catch {
        return;
      }

      if (disposed || token !== rotationToken) return;
      currentAnimation.cancel();
      currentAnimation = null;

      await new Promise((resolve) => {
        window.setTimeout(resolve, UNDERLINE_SETTLE_DELAY);
      });
      if (disposed || token !== rotationToken) return;

      drawUnderline(underline);
    };

    let timer = null;
    const startRotation = () => {
      if (timer == null) timer = window.setInterval(rotate, interval);
    };
    const stopRotation = () => {
      rotationToken += 1;
      if (timer != null) window.clearInterval(timer);
      timer = null;
      currentAnimation?.cancel();
      currentAnimation = null;
      currentUnderlineAnimation?.cancel();
      currentUnderlineAnimation = null;
      if (underline) underline.style.opacity = '1';
      cancelUnderlineAnimations(underline);
    };

    let visibilityObserver = null;
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) startRotation();
          else stopRotation();
        },
        { threshold: 0.25 },
      );
      visibilityObserver.observe(node);
    } else {
      startRotation();
    }

    return () => {
      disposed = true;
      stopRotation();
      visibilityObserver?.disconnect();
    };
  }, [interval, words]);

  return (
    <span className={styles.heroWordInner}>
      <span className={styles.heroWordArea}>
        <span ref={wordRef} className={styles.heroWord}>
          {words[0]}
        </span>
      </span>
      <HandDrawnUnderline ref={underlineRef} />
    </span>
  );
}
