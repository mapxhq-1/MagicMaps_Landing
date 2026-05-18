import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import NeonCtaButton from '../NeonCtaButton/NeonCtaButton';
import styles from './ScrollVideo.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollVideo({ videoSrc }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Still use blob pre-fetching for instant HTTP load access
  useEffect(() => {
    let objectUrl;
    fetch(videoSrc)
      .then((res) => res.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (videoRef.current) {
          videoRef.current.src = objectUrl;
          videoRef.current.onloadedmetadata = () => setIsLoaded(true);
        }
      });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [videoSrc]);

  useGSAP(() => {
    if (!isLoaded || !videoRef.current) return;

    const video = videoRef.current;
    if (isNaN(video.duration) || video.duration === 0) return;

    // Use pure GSAP scrubbing! Since every frame is a keyframe, the browser decoder can instantly seek to any progress value, giving 60FPS fluid motion.
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // 0.5 adds slight interpolation for extra smoothness
      }
    });

    tl.to(video, { currentTime: video.duration, ease: 'none' });

  }, [isLoaded], { scope: containerRef });

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={styles.stickyContainer}>
        {!isLoaded && <div className={styles.loader}>Loading Video Buffer...</div>}
        <video
          ref={videoRef}
          className={styles.video}
          playsInline
          muted
          preload="auto"
          style={{ opacity: isLoaded ? 1 : 0 }}
        ></video>
        <div className={styles.exploreBtnWrap}>
          <NeonCtaButton>Try Now</NeonCtaButton>
        </div>
      </div>
    </div>
  );
}