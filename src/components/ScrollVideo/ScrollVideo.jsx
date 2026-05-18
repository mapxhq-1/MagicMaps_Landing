import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import NeonCtaButton from '../NeonCtaButton/NeonCtaButton'; // Adjust path if needed
import styles from './ScrollVideo.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollVideo({ videoSrc }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.src = videoSrc;
    video.load();

    const handleLoad = () => {
      if (!isLoaded && video.readyState >= 1) {
        setIsLoaded(true);

        // Prime the decoder
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            video.pause();
          }).catch(() => { });
        }

        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    };

    video.addEventListener('loadedmetadata', handleLoad);
    video.addEventListener('loadeddata', handleLoad);
    video.addEventListener('canplay', handleLoad);

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
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (isNaN(video.duration) || video.duration === 0) return;

    let animationFrameId;
    let targetTime = 0;
    let isSeeking = false;

    const handleSeeked = () => {
      isSeeking = false;
    };
    video.addEventListener('seeked', handleSeeked);

    const renderLoop = () => {
      if (!isSeeking && Math.abs(video.currentTime - targetTime) > 0.03) {
        isSeeking = true;
        video.currentTime = targetTime;
      }

      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        if (video && !isNaN(video.duration)) {
          targetTime = self.progress * video.duration;
        }
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('seeked', handleSeeked);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };

  }, [isLoaded], { scope: containerRef });

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={styles.stickyContainer}>
        {!isLoaded && <div className={styles.loader}>Loading Video...</div>}

        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          preload="auto"
          style={{ display: 'none' }}
        ></video>

        <canvas
          ref={canvasRef}
          className={styles.video}
          style={{ opacity: isLoaded ? 1 : 0 }}
        ></canvas>

        <div className={styles.exploreBtnWrap}>
          <NeonCtaButton>Try Now</NeonCtaButton>
        </div>
      </div>
    </div>
  );
}