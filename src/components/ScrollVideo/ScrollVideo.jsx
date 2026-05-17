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

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.src = videoSrc;
    video.load();

    const handleLoad = () => {
      if (!isLoaded && video.readyState >= 1) {
        setIsLoaded(true);
        
        // Prime decoder
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            video.pause();
          }).catch(() => {});
        }

        // Set exact canvas resolution
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        
        // Draw initial frame
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

    // Use a lightweight render function for canvas
    const renderFrame = () => {
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    };

    // Modern browsers support rVFC which fires precisely when a frame is ready
    let rVFC_Id;
    const loop = () => {
      renderFrame();
      rVFC_Id = video.requestVideoFrameCallback(loop);
    };

    if ('requestVideoFrameCallback' in video) {
      rVFC_Id = video.requestVideoFrameCallback(loop);
    } else {
      // Fallback for older Safari
      video.addEventListener('timeupdate', renderFrame);
    }

    // Standard GSAP scrub mapping
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true, // Instant response, no lag
        onUpdate: () => {
          // If fallback is needed (no rVFC), ensure we manually try rendering
          if (!('requestVideoFrameCallback' in video)) {
            renderFrame();
          }
        }
      }
    });

    // Tween the video's actual time. The events above will draw it to canvas
    tl.to(video, { currentTime: video.duration, ease: 'none' });

    return () => {
      if (rVFC_Id && 'cancelVideoFrameCallback' in video) {
        video.cancelVideoFrameCallback(rVFC_Id);
      }
      video.removeEventListener('timeupdate', renderFrame);
    };

  }, [isLoaded], { scope: containerRef });

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={styles.stickyContainer}>
        {!isLoaded && <div className={styles.loader}>Loading Video...</div>}
        
        {/* Hidden video element: Does the heavy lifting of decoding */}
        <video
          ref={videoRef}
          playsInline
          muted
          preload="auto"
          style={{ position: 'absolute', opacity: 0.001, width: '1px', height: '1px', pointerEvents: 'none' }}
        ></video>
        
        {/* Canvas element: Renders 10x faster on mobile DOM than a <video> tag */}
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
