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

  // Direct src assignment is required on mobile (iOS Safari) because it relies on HTTP range requests and often rejects large Blobs.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = videoSrc;
    video.load();

    const handleLoad = () => {
      if (!isLoaded) {
        setIsLoaded(true);
        // Prime the video decoder on mobile (especially iOS Safari) by playing and instantly pausing
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            video.pause();
          }).catch(() => {
            // Auto-play prevented, ignore.
          });
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoad);
    video.addEventListener('loadeddata', handleLoad);
    video.addEventListener('canplay', handleLoad);

    // Fallback interval just in case events don't fire reliably
    const checkInterval = setInterval(() => {
      if (video.readyState >= 1) {
        handleLoad();
        clearInterval(checkInterval);
      }
    }, 250);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoad);
      video.removeEventListener('loadeddata', handleLoad);
      video.removeEventListener('canplay', handleLoad);
      clearInterval(checkInterval);
    };
  }, [videoSrc, isLoaded]);

  useGSAP(() => {
    if (!isLoaded || !videoRef.current) return;

    const video = videoRef.current;
    if (isNaN(video.duration) || video.duration === 0) return;

    // Mobile browser video decoders (especially iOS) freeze if currentTime is updated too rapidly (e.g. 120 times a second on modern phones).
    // We use a proxy object to tween the time, and only push updates to the video element if the change is significant enough (~30fps).
    const proxy = { time: 0 };

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: () => {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      }
    });

    tl.to(proxy, {
      time: video.duration,
      ease: 'none',
      onUpdate: () => {
        if (!videoRef.current) return;
        // Only update the actual video if the time difference is greater than ~1 frame at 30fps
        if (Math.abs(videoRef.current.currentTime - proxy.time) > 0.033) {
          videoRef.current.currentTime = proxy.time;
        }
      }
    });

  }, [isLoaded], { scope: containerRef });

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={styles.stickyContainer}>
        {!isLoaded && <div className={styles.loader}>Loading Video...</div>}
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
