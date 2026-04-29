import React, { useRef } from 'react';
import HeroHeader from './components/HeroHeader/HeroHeader';
import ScrollVideo from './components/ScrollVideo/ScrollVideo';
import Sponsors from './components/Sponsors/Sponsors';
import ScrollReveal from './components/ReactBits/ScrollReveal';
import NeonCtaButton from './components/NeonCtaButton/NeonCtaButton';
import Footer from './components/Footer/Footer';
import vid1 from './assets/videos/vid1-kf.mp4';
import vid2 from './assets/videos/vid2-kf.mp4';
import './App.css';

function App() {
  const quoteSectionRef = useRef(null);

  return (
    <>
      <HeroHeader />
      <ScrollVideo videoSrc={vid1} />
      <Sponsors />
      <ScrollVideo videoSrc={vid2} />

      {/* Same scroll model as ScrollVideo: tall section + sticky inner; one GSAP scrub on section */}
      <section className="quote-section" ref={quoteSectionRef}>
        <div className="quote-sticky">
          <ScrollReveal
            blurStrength={40}
            baseOpacity={0}
            baseRotation={0}
            triggerRef={quoteSectionRef}
            scrub={0.5}
            textSize="clamp(1.25rem, 2.75vw, 2.15rem)"
            textWeight={500}
            textLineHeight={1.65}
            textClassName="quote-text"
          >
            {`For the Curious, For the Changemakers, and for Those Who Question Everything!\n— Magic Maps`}
          </ScrollReveal>
        </div>
      </section>

      <section className="pre-footer-cta" aria-label="Try Magic Maps">
        <NeonCtaButton>Try Now</NeonCtaButton>
      </section>

      <Footer />
    </>
  );
}

export default App;
