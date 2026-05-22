import React, { useEffect, useState } from 'react';
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

function SponsorLogo({ logo, isTouch, isActive, onToggle }) {
  const handleClick = (e) => {
    if (!isTouch) return;
    e.stopPropagation();
    onToggle(logo.src);
  };

  return (
    <div
      className={`${styles.logoSlot} ${styles[logo.slot]}${isActive ? ` ${styles.active}` : ''}`}
      role="group"
      aria-label={logo.label}
      onClick={handleClick}
    >
      <div className={styles.logoMark}>
        <img src={logo.src} alt="" className={styles.logo} />
      </div>

      <span className={styles.label} role="tooltip">
        {logo.label}
      </span>
    </div>
  );
}

export default function Sponsors() {
  const [activeKey, setActiveKey] = useState(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isTouch || activeKey === null) return;

    const close = () => setActiveKey(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [isTouch, activeKey]);

  const handleToggle = (key) => {
    setActiveKey((prev) => (prev === key ? null : key));
  };

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
              <SponsorLogo
                key={logo.src}
                logo={logo}
                isTouch={isTouch}
                isActive={activeKey === logo.src}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
