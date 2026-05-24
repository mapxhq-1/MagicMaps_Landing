import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ScrollVideo.module.css';

const featuredCards = [
  { src: '/cards/1_spacetime.png', alt: 'Spacetime learning card' },
  { src: '/cards/2_timetravel.png', alt: 'Time travel learning card' },
  { src: '/cards/3_createnotes.png', alt: 'Create notes learning card' },
  { src: '/cards/4_oraganize.png', alt: 'Organize learning card' },
];

export default function DesktopMapTextSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const rotatingWords = ['Thinks', 'Reacts', 'Revises'];
  const longestWord = rotatingWords.reduce((a, b) => (a.length >= b.length ? a : b));

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const goToCard = (index) => {
    const clampedIndex = Math.max(0, Math.min(featuredCards.length - 1, index));
    setActiveCardIndex(clampedIndex);
  };

  const handleCardPointerMove = (event) => {
    if (event.pointerType === 'touch') return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const maxTilt = 6;

    card.style.setProperty('--hover-rotate-x', `${(y * maxTilt).toFixed(2)}deg`);
    card.style.setProperty('--hover-rotate-y', `${(-x * maxTilt).toFixed(2)}deg`);
  };

  const handleCardPointerLeave = (event) => {
    const card = event.currentTarget;
    card.style.setProperty('--hover-rotate-x', '0deg');
    card.style.setProperty('--hover-rotate-y', '0deg');
  };

  const getCardStyle = (index) => {
    const distance = index - activeCardIndex;
    const behindIndex = Math.abs(distance);

    if (distance === 0) {
      return {
        '--card-x': '0px',
        '--card-y': '0px',
        '--card-rotate': '0deg',
        '--card-scale': 1,
        '--card-opacity': 1,
        '--card-z': featuredCards.length + 1,
        '--hover-rotate-x': '0deg',
        '--hover-rotate-y': '0deg',
        pointerEvents: 'auto',
      };
    }

    return {
      '--card-x': `${Math.sign(distance) * Math.min(behindIndex * 28, 68)}px`,
      '--card-y': `${Math.min(behindIndex * 16, 48)}px`,
      '--card-rotate': `${Math.sign(distance) * Math.min(behindIndex * 3, 8)}deg`,
      '--card-scale': 1 - Math.min(behindIndex * 0.055, 0.16),
      '--card-opacity': Math.max(0.28, 0.56 - behindIndex * 0.08),
      '--card-z': featuredCards.length - behindIndex,
      '--hover-rotate-x': '0deg',
      '--hover-rotate-y': '0deg',
      pointerEvents: 'none',
    };
  };

  return (
    <section className={styles.desktopMapTextSection}>
      <div className={styles.desktopMapTextSticky}>
        <div className={`${styles.heroText} ${styles.desktopMapText}`}>
          <div className={styles.heroTextLine}>
            <span>The Map that</span>

            <span className={styles.heroWordSlot}>
              <span className={styles.heroWordMeasure} aria-hidden="true">
                {longestWord}
              </span>
              <span className={styles.heroWordInner}>
                <span className={styles.heroWordArea}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className={styles.heroWord}
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <svg
                  className={styles.heroMarkerUnderline}
                  viewBox="0 0 120 18"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    className={`${styles.heroMarkerStroke} ${styles.heroMarkerStrokeMain}`}
                    d="M2 14 C 22 13, 42 6, 60 5 S 98 6, 118 14"
                  />
                  <path
                    className={`${styles.heroMarkerStroke} ${styles.heroMarkerStrokeSoft}`}
                    d="M4 15 C 24 14, 44 8, 60 7 S 96 8, 116 15"
                  />
                </svg>
              </span>
            </span>
          </div>
          <p className={styles.desktopMapCaption}>Specially for Competitive Exam Aspirants !</p>
        </div>

        <div className={styles.desktopFeatureDeck} aria-label="Magic Maps feature cards">
          {featuredCards.map((card, index) => (
            <img
              key={card.src}
              className={styles.desktopFeatureCard}
              style={getCardStyle(index)}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
              src={card.src}
              alt={card.alt}
            />
          ))}
        </div>

        <div className={styles.desktopFeatureControls} aria-label="Feature card controls">
          <button
            className={styles.desktopFeatureButton}
            type="button"
            onClick={() => goToCard(activeCardIndex - 1)}
            disabled={activeCardIndex === 0}
          >
            Previous
          </button>
          <button
            className={styles.desktopFeatureButton}
            type="button"
            onClick={() => goToCard(activeCardIndex + 1)}
            disabled={activeCardIndex === featuredCards.length - 1}
          >
            Next Card
          </button>
        </div>
      </div>
    </section>
  );
}
