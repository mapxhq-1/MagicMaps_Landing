import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Existing Components
import HeroHeader from './components/HeroHeader/HeroHeader';
import ScrollVideo from './components/ScrollVideo/ScrollVideo';
import ScrollImageSequence from './components/ScrollVideo/ScrollImageSequence'; 
import Sponsors from './components/Sponsors/Sponsors';
import ScrollReveal from './components/ReactBits/ScrollReveal';
import Footer from './components/Footer/Footer';
import NeonCtaButton from './components/NeonCtaButton/NeonCtaButton';
import DirectionalCursor from './components/DirectionalCursor/DirectionalCursor';

// New React Bits Components
import DotGrid from './components/ReactBits/DotGrid'; // Adjust path as needed
import Threads from './components/ReactBits/Threads'; // Adjust path as needed

// Assets
import vid1 from './assets/videos/vid1-kf.mp4';
import vid2 from './assets/videos/vid2-kf.mp4';
import './App.css';
import { initScrollPerf } from './utils/scrollPerf';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true,
});

function App() {
  const quoteSectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const cleanupScrollPerf = initScrollPerf();

    const refreshTriggers = () => ScrollTrigger.refresh();
    const refreshTimer = window.setTimeout(refreshTriggers, 400);

    window.addEventListener('load', refreshTriggers);

    return () => {
      cleanupScrollPerf();
      window.clearTimeout(refreshTimer);
      window.removeEventListener('load', refreshTriggers);
    };
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      width: '100%',         /* Ensure it respects the parent #root width */
      overflowX: 'clip'      /* Hard-clip any bleeding canvas/GSAP elements */
    }}>
      <DirectionalCursor />
      
      <div 
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
    backgroundColor: 'transparent' /* Deep, rich black/gray */
  }}
>
  <DotGrid
    gap={10}
    dotSize={3}
    baseColor="#262626"       /* Very subtle dark gray dots that fade into the background */
    activeColor="#00ff66"     /* Bright neon/cyberpunk green on hover */
    proximity={120}           /* Slightly tighter hover radius so the green looks sharper */
    shockRadius={100}
    shockStrength={4}
  />
</div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        <HeroHeader />

        {isMobile ? (
          
          <ScrollImageSequence frameCount={600} framePath="/frames/vid1_mobile/frame_" />
        ) : (
          <ScrollVideo videoSrc={vid1} />
        )}

        <Sponsors />

        {isMobile ? (
          <ScrollImageSequence frameCount={561} framePath="/frames/vid2_mobile/frame_" />
        ) : (
          <ScrollVideo videoSrc={vid2} />
        )}

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

        <div className="footer-transition">
          <div className="footer-divider-sticky">
            <div className="pre-footer-cta">
              <NeonCtaButton>Try Now</NeonCtaButton>
            </div>

            <div className="separator-band" aria-hidden="true">
              <div className="threads-wrap">
                <Threads
                  tricolor
                  amplitude={2.5}
                  distance={0.3}
                  lineWidth={20}
                  enableMouseInteraction={true}
                />
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>

    </div>
  );
}

export default App;