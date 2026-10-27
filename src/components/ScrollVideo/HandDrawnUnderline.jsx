import { forwardRef } from 'react';
import styles from './ScrollVideo.module.css';

const HandDrawnUnderline = forwardRef(function HandDrawnUnderline(_props, ref) {
  return (
    <svg
      ref={ref}
      className={styles.heroMarkerUnderline}
      viewBox="0 0 120 18"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className={`${styles.heroMarkerStroke} ${styles.heroMarkerStrokeMain}`}
        d="M3 5 L117 1 L120 13 L7 17 Z"
      />
      <path
        className={`${styles.heroMarkerStroke} ${styles.heroMarkerStrokeSoft}`}
        d="M5 8 L116 4 L118 10 L7 14 Z"
      />
    </svg>
  );
});

export default HandDrawnUnderline;
