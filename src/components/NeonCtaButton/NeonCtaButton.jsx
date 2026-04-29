import React from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './NeonCtaButton.module.css';

export default function NeonCtaButton({ children, className = '', ...rest }) {
  return (
    <button type="button" className={`${styles.btn} ${className}`.trim()} {...rest}>
      {children}
      <ArrowRight className={styles.icon} size={20} aria-hidden />
    </button>
  );
}
