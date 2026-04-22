import React from 'react';
import HeroHeader from './components/HeroHeader/HeroHeader';
import ScrollVideo from './components/ScrollVideo/ScrollVideo';
import Sponsors from './components/Sponsors/Sponsors';
import ScrollReveal from './components/ReactBits/ScrollReveal';
import Footer from './components/Footer/Footer';
import vid1 from './assets/videos/vid1-kf.mp4';
import vid2 from './assets/videos/vid2-kf.mp4';
import './App.css';

function App() {
  return (
    <>
      <HeroHeader />
      <ScrollVideo videoSrc={vid1} />
      <Sponsors />
      <ScrollVideo videoSrc={vid2} />

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2rem', textAlign: 'center' }}>
        <ScrollReveal blurStrength={40} baseOpacity={0} baseRotation={0}>
          {`FOR THE CURIOUS, FOR THE CHANGEMAKER AND FOR THOSE WHO QUESTION EVERYTHING\n-Magic Maps`}
        </ScrollReveal>
      </div>

      <Footer />
    </>
  );
}

export default App;
