import React, { useState } from 'react';
import styles from './ScrollVideo.module.css';

const featuredCards = [
  { src: '/cards/1_spacetime.png', alt: 'Spacetime learning card' },
  { src: '/cards/2_timetravel.png', alt: 'Time travel learning card' },
  { src: '/cards/3_createnotes.png', alt: 'Create notes learning card' },
  { src: '/cards/4_oraganize.png', alt: 'Organize learning card' },
];

export default function MobileFeatureCardsSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const goToCard = (index) => {
    const clampedIndex = Math.max(0, Math.min(featuredCards.length - 1, index));
    setActiveCardIndex(clampedIndex);
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
      };
    }

    return {
      '--card-x': `${Math.sign(distance) * Math.min(behindIndex * 14, 34)}px`,
      '--card-y': `${Math.min(behindIndex * 8, 24)}px`,
      '--card-rotate': `${Math.sign(distance) * Math.min(behindIndex * 3, 8)}deg`,
      '--card-scale': 1 - Math.min(behindIndex * 0.055, 0.16),
      '--card-opacity': Math.max(0.28, 0.56 - behindIndex * 0.08),
      '--card-z': featuredCards.length - behindIndex,
      '--hover-rotate-x': '0deg',
      '--hover-rotate-y': '0deg',
    };
  };

  return (
    <section className={styles.mobileFeatureCardsSection}>
      <div
        className={`${styles.desktopFeatureDeck} ${styles.mobileFeatureDeck}`}
        aria-label="Magic Maps feature cards"
      >
        {featuredCards.map((card, index) => (
          <img
            key={card.src}
            className={styles.desktopFeatureCard}
            style={getCardStyle(index)}
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
    </section>
  );
}
