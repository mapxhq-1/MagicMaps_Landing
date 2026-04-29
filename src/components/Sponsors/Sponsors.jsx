import React from 'react';
import { Apple, Sparkles, Gem, Shield } from 'lucide-react';
import styles from './Sponsors.module.css';

const iconSize = 18;

export default function Sponsors() {
  return (
    <section className={styles.wrapper} aria-label="Backed by funding partners">
      <div className={styles.container}>
        <p className={styles.title}>Backed by</p>
        <div className={styles.icons}>
          <div className={styles.circle} aria-hidden>
            <Apple size={iconSize} />
          </div>
          <div className={styles.circle} aria-hidden>
            <Sparkles size={iconSize} />
          </div>
          <div className={styles.circle} aria-hidden>
            <Gem size={iconSize} />
          </div>
          <div className={styles.circle} aria-hidden>
            <Shield size={iconSize} />
          </div>
        </div>
      </div>
    </section>
  );
}
