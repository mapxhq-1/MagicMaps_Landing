import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const rotatingWords = ['Thinks', 'Reacts', 'Revises'];
  const longestWord = rotatingWords.reduce((a, b) => (a.length >= b.length ? a : b));

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance cards in an infinite loop, pauses on hover
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % featuredCards.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isHovered]);

  const goToCard = (index) => {
    // Infinite loop: wrap around
    const wrappedIndex = (index + featuredCards.length) % featuredCards.length;
    setActiveCardIndex(wrappedIndex);
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

        {/* Deck wrapper with flanking arrow buttons */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'min(86vw, 880px)',
            marginTop: 'clamp(8rem, 20vh, 13rem)',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left arrow */}
          <button
            type="button"
            aria-label="Previous card"
            onClick={() => goToCard(activeCardIndex - 1)}
            style={{
              position: 'absolute',
              left: 'calc(-2.6rem - 8px)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              background: 'none',
              border: 'none',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.72,
              transition: 'opacity 160ms ease, transform 160ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.72; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="16" cy="16" r="15" stroke="#111" strokeWidth="1.5" fill="rgba(255,255,255,0.7)" />
              <path d="M18.5 10L12.5 16L18.5 22" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Card deck */}
          <div
            className={styles.desktopFeatureDeck}
            aria-label="Magic Maps feature cards"
            style={{ marginTop: 0, width: '100%' }}
          >
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

          {/* Right arrow */}
          <button
            type="button"
            aria-label="Next card"
            onClick={() => goToCard(activeCardIndex + 1)}
            style={{
              position: 'absolute',
              right: 'calc(-2.6rem - 8px)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              background: 'none',
              border: 'none',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.72,
              transition: 'opacity 160ms ease, transform 160ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.72; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="16" cy="16" r="15" stroke="#111" strokeWidth="1.5" fill="rgba(255,255,255,0.7)" />
              <path d="M13.5 10L19.5 16L13.5 22" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}