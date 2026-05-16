import React from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './NeonCtaButton.module.css';

const APP_URL = 'https://app.magicmaps.in/';

export default function NeonCtaButton({
  children,
  className = '',
  href = APP_URL,
  target = '_blank',
  rel = 'noopener noreferrer',
  ...rest
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`${styles.btn} ${className}`.trim()}
      {...rest}
    >
      {children}
      <ArrowRight className={styles.icon} size={20} aria-hidden />
    </a>
  );
}
