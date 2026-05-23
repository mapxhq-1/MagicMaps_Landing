import React, { useCallback, useEffect, useRef } from 'react';
import styles from './MobilePreviewFrame.module.css';

export default function MobilePreviewFrame({ children, onScreen, backgrounds }) {
  const screenRef = useRef(null);

  const setScreenRef = useCallback(
    (node) => {
      screenRef.current = node;
      if (onScreen) onScreen(node);
    },
    [onScreen],
  );

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return undefined;

    const syncViewportUnit = () => {
      screen.style.setProperty('--preview-vh', `${screen.clientHeight}px`);
      window.dispatchEvent(new Event('resize'));
    };

    syncViewportUnit();
    const observer = new ResizeObserver(syncViewportUnit);
    observer.observe(screen);
    window.addEventListener('resize', syncViewportUnit);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncViewportUnit);
    };
  }, [onScreen]);

  return (
    <div className={styles.shell}>
      <p className={styles.label}>Mobile preview · 390 × 844</p>
      <div className={styles.frameWrap}>
        <div className={styles.frame} aria-label="Mobile device frame">
          <div className={styles.notch} aria-hidden="true" />
          <div ref={setScreenRef} className={`${styles.screen} phoneScreen`}>
            <div className={styles.screenBackgrounds}>{backgrounds}</div>
            <div className={styles.screenInner}>{children}</div>
          </div>
        </div>
      </div>
      <p className={styles.hint}>Scroll inside the phone · remove ?mobile=1 to exit</p>
    </div>
  );
}
