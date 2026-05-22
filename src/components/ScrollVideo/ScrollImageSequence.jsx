import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import NeonCtaButton from '../NeonCtaButton/NeonCtaButton';
import { createCanvasScrollRenderer } from '../../utils/canvasScrollFrame';
import styles from './ScrollVideo.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollImageSequence({ frameCount, framePath }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const imagesRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    const images = new Array(frameCount);
    let loadedCount = 0;

    const onFrameLoaded = (index, img) => {
      if (cancelled) return;
      loadedCount += 1;
      const progress = Math.round((loadedCount / frameCount) * 100);
      setLoadProgress(progress);

      if (index === 0 && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }

      if (loadedCount === frameCount) {
        setIsReady(true);
      }
    };

    for (let i = 1; i <= frameCount; i += 1) {
      const img = new Image();
      const index = i - 1;
      const paddedIndex = String(i).padStart(4, '0');
      img.decoding = 'async';
      img.src = `${framePath}${paddedIndex}.jpg`;
      img.onload = () => onFrameLoaded(index, img);
      images[index] = img;
    }

    imagesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, [frameCount, framePath]);

  useGSAP(
    () => {
      if (!isReady || !canvasRef.current || !containerRef.current) return undefined;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return undefined;

      ctx.imageSmoothingEnabled = false;
      const images = imagesRef.current;

      const frameStepForVelocity = (velocity) => {
        const v = Math.abs(velocity);
        if (v > 3500) return 3;
        if (v > 1500) return 2;
        return 1;
      };

      const renderer = createCanvasScrollRenderer((progress, velocity, lastFrame) => {
        const rawIndex = Math.floor(progress * (frameCount - 1));
        const step = frameStepForVelocity(velocity);
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(rawIndex / step) * step,
        );

        if (frameIndex === lastFrame) return -1;

        const img = images[frameIndex];
        if (img?.complete) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        return frameIndex;
      });

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
        fastScrollEnd: 2500,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          renderer.render(self.progress, self.getVelocity());
        },
      });

      return () => {
        renderer.dispose();
        trigger.kill();
      };
    },
    [isReady, frameCount],
    { scope: containerRef },
  );

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={styles.stickyContainer}>
        {!isReady && (
          <div className={styles.loader}>
            Loading Experience... {loadProgress}%
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={styles.video}
          style={{
            opacity: isReady ? 1 : 0,
            width: '100%',
            height: '100vh',
            objectFit: 'contain',
          }}
        />

        <div className={styles.exploreBtnWrap}>
          <NeonCtaButton>Try Now</NeonCtaButton>
        </div>
      </div>
    </div>
  );
}
