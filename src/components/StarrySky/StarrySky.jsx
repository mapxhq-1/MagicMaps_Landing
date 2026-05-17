import React, { useMemo, useEffect, useRef } from 'react';
import './StarrySky.css';

export default function StarrySky({ showMountains = false }) {
  const generateSvgStars = (count, size, opacityRange) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const cx = (Math.random() * 100).toFixed(2) + '%';
      const cy = (Math.random() * 100).toFixed(2) + '%';
      const r = size + Math.random() * 0.5;
      const opacity = opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]);
      
      const rand = Math.random();
      let fill = '#ffffff';
      if (rand > 0.8) fill = '#dbe7ff'; // light blue
      else if (rand > 0.6) fill = '#fff8e7'; // light yellow

      stars.push(<circle key={i} cx={cx} cy={cy} r={r} fill={fill} fillOpacity={opacity} />);
    }
    return stars;
  };

  // Generate 3 layers of stars for depth
  const starsLayer1 = useMemo(() => generateSvgStars(400, 0.5, [0.2, 0.6]), []);
  const starsLayer2 = useMemo(() => generateSvgStars(150, 1.0, [0.5, 0.9]), []);
  const starsLayer3 = useMemo(() => generateSvgStars(50, 1.5, [0.8, 1.0]), []);

  const stars1Ref = useRef(null);
  const stars2Ref = useRef(null);
  const stars3Ref = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalized mouse coordinates from center of screen (-1 to +1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;

      // Subtle parallax effect
      if (stars1Ref.current) stars1Ref.current.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
      if (stars2Ref.current) stars2Ref.current.style.transform = `translate(${x * -25}px, ${y * -25}px)`;
      if (stars3Ref.current) stars3Ref.current.style.transform = `translate(${x * -45}px, ${y * -45}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="starry-sky-container">
      <div className="starry-bg"></div>
      
      <svg ref={stars1Ref} className="stars-svg layer-1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        {starsLayer1}
      </svg>
      <svg ref={stars2Ref} className="stars-svg layer-2" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        {starsLayer2}
      </svg>
      <svg ref={stars3Ref} className="stars-svg layer-3" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        {starsLayer3}
      </svg>
      
      {showMountains && (
        <div className="mountains-container">
          <div className="horizon-glow"></div>
          <svg preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" className="mountain-svg">
            {/* Distant mountains (Fixed path so it does not curve out of viewBox) */}
            <path d="M0,120 L0,80 Q 150,30 250,70 Q 350,110 500,60 Q 600,20 750,60 Q 900,100 1000,50 Q 1100,10 1200,70 L1200,120 Z" fill="#0f0f13" />
            {/* Mid mountains */}
            <path d="M0,120 L0,100 Q 150,130 350,80 Q 550,30 750,90 Q 950,140 1100,70 Q 1150,40 1200,80 L1200,120 Z" fill="#050508" />
            {/* Foreground mountains */}
            <path d="M0,120 L0,110 Q 250,140 500,100 Q 750,60 1000,110 Q 1100,130 1200,105 L1200,120 Z" fill="#000000" />
          </svg>
        </div>
      )}
    </div>
  );
}
