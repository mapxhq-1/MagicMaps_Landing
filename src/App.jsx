import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroHeader from './components/HeroHeader/HeroHeader';
import ScrollVideo from './components/ScrollVideo/ScrollVideo';
import ScrollImageSequence from './components/ScrollVideo/ScrollImageSequence'; // <-- Import the new mobile component
import Sponsors from './components/Sponsors/Sponsors';
import ScrollReveal from './components/ReactBits/ScrollReveal';
import Footer from './components/Footer/Footer';

// Only import Desktop videos (Mobile images will be fetched from the public folder)
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
    <>
      <HeroHeader />

      {/* Video 1 Section */}
      {isMobile ? (
        <ScrollImageSequence
          frameCount={600} // Change this to the exact number of frames generated for vid1
          framePath="/frames/vid1_mobile/frame_" // Ensure this points to your public folder
        />
      ) : (
        <ScrollVideo videoSrc={vid1} />
      )}

      <Sponsors />

      {/* Video 2 Section */}
      {isMobile ? (
        <ScrollImageSequence
          frameCount={561} // Change this to the exact number of frames generated for vid2
          framePath="/frames/vid2_mobile/frame_"
        />
      ) : (
        <ScrollVideo videoSrc={vid2} />
      )}

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

      <Footer />
    </>
  );
}

export default App;