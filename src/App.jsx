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

// New React Bits Components
import DotGrid from './components/ReactBits/DotGrid'; // Adjust path as needed
import Threads from './components/ReactBits/Threads'; // Adjust path as needed

// Assets
import vid1 from './assets/videos/vid1-kf.mp4';
import vid2 from './assets/videos/vid2-kf.mp4';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const quoteSectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      
      <div 
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    backgroundColor: '#0a0a0a' /* Deep, rich black/gray */
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

      {/* 3. THE CONTENT LAYER */}
      {/* Everything here sits ON TOP of the grid */}
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

        {/* THREADS SEPARATOR */}
       {/* SPACER: Keeps it away from the quote section */}
        <div style={{ height: '100px', width: '100%', pointerEvents: 'none' }} />

        {/* THREADS SEPARATOR */}
        <div 
          style={{ 
            width: '100%',
            height: '150px',
            position: 'relative',
            zIndex: 50,             /* Keeps the waves rendering ON TOP of the footer */
            marginBottom: '-75px',  /* Pulls the footer UP by exactly half the container's height */
            pointerEvents: 'auto' 
          }}
        >
          <Threads
            amplitude={2}
            distance={0.2}
            enableMouseInteraction={true}
            color={[1, 1, 1]}
          />
        </div>

        <Footer />
      </div>

    </div>
  );
}

export default App;