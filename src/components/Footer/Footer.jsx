import React from 'react';
import { Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <section className="footer-section">
      <div className={styles.container}>
        <a href="mailto:hello@happydyno.com" className={styles.email}>
          <Mail size={24} /> hello@happydyno.com
        </a>
        <p className={styles.built}>Built with ❤️</p>
      </div>
    </section>
  )
}
