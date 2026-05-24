import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Existing Components
import HeroHeader from './components/HeroHeader/HeroHeader';
import ScrollVideo from './components/ScrollVideo/ScrollVideo';
import ScrollImageSequence from './components/ScrollVideo/ScrollImageSequence'; 
import DesktopMapTextSection from './components/ScrollVideo/DesktopMapTextSection';
import MobileFeatureCardsSection from './components/ScrollVideo/MobileFeatureCardsSection';
import Sponsors from './components/Sponsors/Sponsors';
import ScrollReveal from './components/ReactBits/ScrollReveal';
import Footer from './components/Footer/Footer';
import NeonCtaButton from './components/NeonCtaButton/NeonCtaButton';
import DirectionalCursor from './components/DirectionalCursor/DirectionalCursor';
import MobilePreviewFrame from './components/MobilePreviewFrame/MobilePreviewFrame';

// New React Bits Components
import DotGrid from './components/ReactBits/DotGrid'; // Adjust path as needed
import Threads from './components/ReactBits/Threads'; // Adjust path as needed

// Assets
import vid1 from './assets/videos/vid1-kf.mp4';
import vid2 from './assets/videos/vid2-kf.mp4';
import useMobilePreview from './hooks/useMobilePreview';
import usePreviewScroller from './hooks/usePreviewScroller';
import './App.css';
import { initScrollPerf } from './utils/scrollPerf';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true,
});

function App() {
  const quoteSectionRef = useRef(null);
  const { isMobile, showPhoneFrame } = useMobilePreview();
  const [previewScreen, setPreviewScreen] = useState(null);

  usePreviewScroller(showPhoneFrame, previewScreen);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [isMobile, showPhoneFrame, previewScreen]);

  useEffect(() => {
    if (showPhoneFrame) return undefined;

    const cleanupScrollPerf = initScrollPerf();

    const refreshTriggers = () => ScrollTrigger.refresh();
    const refreshTimer = window.setTimeout(refreshTriggers, 400);

    window.addEventListener('load', refreshTriggers);

    return () => {
      cleanupScrollPerf();
      window.clearTimeout(refreshTimer);
      window.removeEventListener('load', refreshTriggers);
    };
  }, [showPhoneFrame]);

  const siteBackgrounds = (
    <>
      <div className="siteBackground" aria-hidden="true" />
      <div className="siteBackgroundDots">
        <DotGrid
          gap={isMobile ? 4 : 10}
          dotSize={isMobile ? 2 : 3}
          baseColor="#d5cfc6"
          activeColor="#7bc896"
          proximity={isMobile ? 40 : 120}
          shockRadius={isMobile ? 40 : 100}
          shockStrength={4}
        />
      </div>
    </>
  );

  const mainContent = (
    <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
      <HeroHeader />

      {isMobile ? (
        <ScrollImageSequence frameCount={561} framePath="/frames/vid2_mobile/frame_" />
      ) : (
        <ScrollVideo videoSrc={vid1} />
      )}

      <Sponsors />

      {isMobile ? (
        <ScrollImageSequence frameCount={600} framePath="/frames/vid1_mobile/frame_" />
      ) : (
        <ScrollVideo videoSrc={vid2} />
      )}

      {!isMobile && <DesktopMapTextSection />}
      {isMobile && <MobileFeatureCardsSection />}

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
  );

  const appShell = (
    <div
      style={{
        position: 'relative',
        minHeight: showPhoneFrame ? '100%' : '100vh',
        width: '100%',
        overflowX: 'clip',
      }}
    >
      {!isMobile && !showPhoneFrame && <DirectionalCursor />}
      {!showPhoneFrame && siteBackgrounds}
      {mainContent}
    </div>
  );

  if (showPhoneFrame) {
    return (
      <MobilePreviewFrame onScreen={setPreviewScreen} backgrounds={siteBackgrounds}>
        {appShell}
      </MobilePreviewFrame>
    );
  }

  return appShell;
}

export default App;