import React from 'react';
import styles from './Sponsors.module.css';

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
  return (
    <div className={`${styles.logoSlot} ${styles[logo.slot]}`} aria-label={logo.label}>
      <div className={styles.logoMark}>
        <img src={logo.src} alt="" className={styles.logo} />
      </div>
      <p className={styles.tooltip} aria-hidden="true">
        {logo.label}
      </p>
    </div>
  );
}

export default function Sponsors() {
  return (
    <section className={styles.wrapper} aria-label="Backed by funding partners">
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
