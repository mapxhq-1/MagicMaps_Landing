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
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useGSAP(() => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (isNaN(video.duration) || video.duration === 0) return;

    let animationFrameId;
    let targetTime = 0;
    let isSeeking = false; // The crucial lock

    // 1. Listen for when the video actually finishes seeking
    const handleSeeked = () => {
      isSeeking = false;
    };
    video.addEventListener('seeked', handleSeeked);

    // 2. The Render Loop
    const renderLoop = () => {
      // Only request a new frame if the video isn't currently busy processing one
      // and if the user has scrolled far enough to warrant a visual update.
      if (!isSeeking && Math.abs(video.currentTime - targetTime) > 0.03) {
        isSeeking = true;
        video.currentTime = targetTime;
      }

      // Always keep drawing whatever frame the video currently has
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // 3. GSAP simply updates the target time, it doesn't force the video to seek
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        if (video && !isNaN(video.duration)) {
          // We just log where the user IS, the rAF loop handles getting the video there
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

  // 2. GSAP and Canvas Render Loop
  useGSAP(() => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (isNaN(video.duration) || video.duration === 0) return;

    let animationFrameId;

    // Continuously draw to canvas via rAF. 
    // This forces mobile browsers to paint the frame even when the video is paused.
    const renderLoop = () => {
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Start the loop
    renderLoop();

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      // Instead of manual JS throttling, use a slight GSAP scrub smoothing.
      // scrub: 0.1 acts as a micro-buffer, preventing 120Hz mobile screens 
      // from overwhelming the hardware video decoder with seek requests.
      scrub: 0.1,
      onUpdate: (self) => {
        if (video && !isNaN(video.duration)) {
          video.currentTime = self.progress * video.duration;
        }
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };

  }, [isLoaded], { scope: containerRef });

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={styles.stickyContainer}>
        {!isLoaded && <div className={styles.loader}>Loading Video...</div>}

        {/* 
          Hidden video element: 
          Instead of 1x1px, use `display: none`. Modern browsers keep decoding 
          in memory when JS retains the reference, but this avoids iOS Safari's 
          "invisible element" power-saving bugs on the DOM level.
        */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay // Ensures iOS policies are satisfied immediately
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