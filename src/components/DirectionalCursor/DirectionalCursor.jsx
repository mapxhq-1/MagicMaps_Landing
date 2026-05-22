import { useEffect, useRef, useState } from 'react';
import styles from './DirectionalCursor.module.css';

/* SVG tip at (4,4) points upper-left; +135° aligns tip with movement angle (0° = right) */
const ARROW_BASE_OFFSET_DEG = 135;
const MOVE_THRESHOLD_SQ = 16;
const ANGLE_LERP = 0.35;

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input[type="submit"], input[type="reset"], input[type="button"], .cursor-pointer, select, label[for]';

function lerpAngle(current, target, t) {
  let diff = target - current;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return current + diff * t;
}

function isTextInput(el) {
  if (!el || !(el instanceof Element)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

function isInteractive(el) {
  if (!el || !(el instanceof Element)) return false;
  return Boolean(el.closest(INTERACTIVE_SELECTOR));
}

export default function DirectionalCursor() {
  const cursorRef = useRef(null);
  const angleRef = useRef(-ARROW_BASE_OFFSET_DEG);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return undefined;

    document.documentElement.classList.add('directional-cursor-active');

    const onMove = (e) => {
      const { clientX: x, clientY: y } = e;
      const last = lastPosRef.current;
      const dx = x - last.x;
      const dy = y - last.y;

      if (dx * dx + dy * dy >= MOVE_THRESHOLD_SQ) {
        const targetDeg =
          (Math.atan2(dy, dx) * 180) / Math.PI + ARROW_BASE_OFFSET_DEG;
        angleRef.current = lerpAngle(angleRef.current, targetDeg, ANGLE_LERP);
        lastPosRef.current = { x, y };
      }

      const el = document.elementFromPoint(x, y);
      const hide = isTextInput(el);
      const overInteractive = !hide && isInteractive(el);

      setVisible(!hide);
      setInteractive(overInteractive);

      const node = cursorRef.current;
      if (!node) return;

      node.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0) rotate(${angleRef.current}deg)`;
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      document.documentElement.classList.remove('directional-cursor-active');
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={styles.cursor}
      aria-hidden="true"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <svg
        className={`${styles.arrow} ${interactive ? styles.arrowInteractive : styles.arrowDefault}`}
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 4 L24 10 L13 13 L10 24 L4 4 Z"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
