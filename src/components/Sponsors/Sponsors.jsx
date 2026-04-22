import React from 'react';
import { Apple } from 'lucide-react';
import styles from './Sponsors.module.css';

export default function Sponsors() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <h2>Backed by:</h2>
        <div className={styles.icons}>
          <div className={styles.circle}><Apple size={28} /></div>
          {/* <div className={styles.circle}><Twitch size={28} /></div> */}
          {/* <div className={styles.circle}><Twitter size={28} /></div> */}
          {/* <div className={styles.circle}><Github size={28} /></div> */}
          {/* <div className={styles.circle}><Figma size={28}/></div> */}
        </div>
      </div>
    </section>
  )
}
