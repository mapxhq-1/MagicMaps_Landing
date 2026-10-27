import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown } from 'lucide-react';
import NeonCtaButton from '../NeonCtaButton/NeonCtaButton';
import RotatingWord from './RotatingWord';
import { createCanvasScrollRenderer } from '../../utils/canvasScrollFrame';
import { createImageSequenceLoader } from '../../utils/imageSequenceLoader';
import styles from './ScrollVideo.module.css';

gsap.registerPlugin(ScrollTrigger);

const ROTATING_WORDS = ['Thinks', 'Reacts', 'Revises'];
const LONGEST_ROTATING_WORD = ROTATING_WORDS.reduce((a, b) =>
  a.length >= b.length ? a : b,
);

export default function ScrollImageSequence({ frameCount, framePath }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollHintRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isNearViewport, setIsNearViewport] = useState(false);

  const loaderRef = useRef(null);
  const retryCurrentRenderRef = useRef(null);

  // Do not let the lower sequence compete with the content currently on screen.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window)) {
      const fallbackTimer = window.setTimeout(() => setIsNearViewport(true), 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200% 0px' },
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Decode only a rolling window around the requested scroll frame.
  useEffect(() => {
    if (!isNearViewport) return undefined;

    const loader = createImageSequenceLoader({
      frameCount,
      getFrameSources: (index) => {
        const frameNumber = String(index + 1).padStart(4, '0');
        return [`${framePath}${frameNumber}.webp`];
      },
      onFrameReady: (index, frame) => {
        if (index === 0 && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { alpha: false });

          if (ctx) {
            canvas.width = frame.width;
            canvas.height = frame.height;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
            setLoadProgress(100);
            setHasFirstFrame(true);
            setIsReady(true);
          }
        }

        retryCurrentRenderRef.current?.();
      },
    });

    loaderRef.current = loader;
    loader.requestWindow(0, 1);

    return () => {
      retryCurrentRenderRef.current = null;
      loader.dispose();
      loaderRef.current = null;
    };
  }, [frameCount, framePath, isNearViewport]);

  // Scroll animation
  useGSAP(
    () => {
      if (!isReady || !canvasRef.current || !containerRef.current) {
        return undefined;
      }

      const canvas = canvasRef.current;

      const ctx = canvas.getContext('2d', { alpha: false });

      if (!ctx) return undefined;

      ctx.imageSmoothingEnabled = false;

      const frameStepForVelocity = (velocity) => {
        const v = Math.abs(velocity);

        if (v > 3500) return 3;

        if (v > 1500) return 2;

        return 1;
      };

      let latestProgress = 0;
      let latestVelocity = 0;
      let lastRequestedFrame = 0;

      const renderer = createCanvasScrollRenderer(
        (progress, velocity, lastFrame) => {
          const rawIndex = Math.floor(progress * (frameCount - 1));

          const step = frameStepForVelocity(velocity);

          const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(rawIndex / step) * step,
          );

          const loader = loaderRef.current;
          if (!loader) return -1;

          if (frameIndex !== lastRequestedFrame) {
            const direction = frameIndex < lastRequestedFrame ? -1 : 1;
            lastRequestedFrame = frameIndex;
            loader.requestWindow(frameIndex, direction);
          }

          const closest = loader.getClosestFrame(frameIndex);
          if (!closest || closest.index === lastFrame) return -1;

          ctx.drawImage(closest.frame, 0, 0, canvas.width, canvas.height);
          return closest.index;
        },
      );

      const retryCurrentRender = () => {
        renderer.render(latestProgress, latestVelocity);
      };
      retryCurrentRenderRef.current = retryCurrentRender;

      const setHintOpacity = scrollHintRef.current
        ? gsap.quickTo(scrollHintRef.current, 'opacity', {
          duration: 0.25,
          ease: 'power2.out',
        })
        : null;
      let hintIsVisible = true;

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
        fastScrollEnd: 2500,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onUpdate: (self) => {
          latestProgress = self.progress;
          latestVelocity = self.getVelocity();
          renderer.render(latestProgress, latestVelocity);

          const shouldShowHint = self.progress <= 0.03;
          if (setHintOpacity && shouldShowHint !== hintIsVisible) {
            hintIsVisible = shouldShowHint;
            setHintOpacity(shouldShowHint ? 1 : 0);
          }
        },
      });

      // Floating scroll hint animation
      gsap.to(scrollHintRef.current, {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'power1.inOut',
      });

      return () => {
        if (retryCurrentRenderRef.current === retryCurrentRender) {
          retryCurrentRenderRef.current = null;
        }
        renderer.dispose();
        trigger.kill();
      };
    },
    [isReady, frameCount],
    { scope: containerRef },
  );

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={`${styles.stickyContainer} ${styles.stickyContainerCard}`}>
        <div className={styles.heroText}>
          <div className={styles.heroTextLine}>
            <span>The Map that</span>

            <span className={styles.heroWordSlot}>
              <span className={styles.heroWordMeasure} aria-hidden="true">
                {LONGEST_ROTATING_WORD}
              </span>

              <RotatingWord words={ROTATING_WORDS} />
            </span>
          </div>
        </div>

        <p className={styles.cardCaption}>
          Visual learning built for competitive exam aspirants.
        </p>

        <div className={styles.cardStage}>
          <div className={styles.floatingCard}>
            {!isReady && (
              <div className={styles.loader}>
                Loading Experience... {loadProgress}%
              </div>
            )}

            <canvas
              ref={canvasRef}
              className={styles.video}
              style={{
                opacity: hasFirstFrame ? 1 : 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* Scroll Hint */}
        <div ref={scrollHintRef} className={styles.scrollHint}>
          <span>Scroll</span>

          <div className={styles.scrollArrow}>
            <ChevronDown size={18} strokeWidth={2} />
          </div>
        </div>

        <div className={styles.cardCtaWrap}>
          <NeonCtaButton>Try Now</NeonCtaButton>
        </div>
      </div>
    </div>
  );
}
