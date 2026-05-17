import React, { useState } from 'react';
import styles from './Sponsors.module.css';
import StarrySky from '../StarrySky/StarrySky';

const logos = [
  {
    src: '/1.png',
    slot: 'slot1',
    label: 'Rajiv Gandhi Entrepreneurship Program & ELEVATE Winner.',
  },
  {
    src: '/2.png',
    slot: 'slot2',
    label: 'Karnataka Innovation and Technology Society(KITS), Department of E, IT, & Bt.',
  },
  {
    src: '/3.png',
    slot: 'slot3',
    label: 'Indian Institute of Science (IISc) - Centre of Excellence in Design, DM.',
  },
  {
    src: '/4.png',
    slot: 'slot4',
    label: 'ME-RIISE Foundation - Malnad College of Engineering, Hassan',
  },
];

function SponsorLogo({ logo }) {
  // 1. State to track if hovered and the current mouse coordinates
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 2. Update coordinates on mouse move
  const handleMouseMove = (e) => {
    setMousePos({
      x: e.clientX,
      y: e.clientY
    });
  };

  return (
    <div
      className={`${styles.logoSlot} ${styles[logo.slot]}`}
      aria-label={logo.label}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <div className={styles.logoMark}>
        <img src={logo.src} alt="" className={styles.logo} />
      </div>

      {/* 3. Conditionally render the tooltip with inline styles for positioning */}
      {isHovering && (
        <p
          className={styles.tooltip}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: `${mousePos.x + 15}px`, // Added 15px offset so the cursor doesn't cover the text
            top: `${mousePos.y + 15}px`,
            pointerEvents: 'none', // Crucial: stops the tooltip from causing mouseLeave events
            zIndex: 9999, // Ensures it floats above other elements
          }}
        >
          {logo.label}
        </p>
      )}
    </div>
  );
}

export default function Sponsors() {
  return (
    <section className={styles.wrapper} aria-label="Backed by funding partners">
      <StarrySky showMountains={true} />
      <div className={styles.surface}>
        <div className={styles.container}>
          <p className={styles.title}>
            <span>Backed</span>
            <span className={styles.titleBy}>by</span>
          </p>
          <div className={styles.icons}>
            {logos.map((logo) => (
              <SponsorLogo key={logo.src} logo={logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}