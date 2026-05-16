import React from 'react';
import styles from './Sponsors.module.css';

const iconSize = 21;

export default function Sponsors() {
  return (
    <section className={styles.wrapper} aria-label="Backed by funding partners">
      <div className={styles.surface}>
        <div className={styles.container}>
          <p className={styles.title}>Backed by</p>
          <div className={styles.icons}>

            <div className={styles.rectangle} aria-hidden>
              <img src="/1.png" alt="" height={iconSize} />
            </div>

            <div className={styles.circle} aria-hidden>
              <img src="/2.png" alt="" width={iconSize} height={iconSize} />
            </div>

            <div className={styles.circle} aria-hidden>
              <img src="/3.png" alt="" width={iconSize} height={iconSize} />
            </div>

            <div className={styles.rectangle} aria-hidden>
              <img src="/4.png" alt="" height={iconSize} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}