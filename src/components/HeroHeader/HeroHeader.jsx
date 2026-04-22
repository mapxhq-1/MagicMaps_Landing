import React from 'react';
import styles from './HeroHeader.module.css';

export default function HeroHeader() {
  return (
    <div className={styles.logoContainer}>
      <span className={styles.logoText}>Magic Maps</span>
    </div>
  );
}
