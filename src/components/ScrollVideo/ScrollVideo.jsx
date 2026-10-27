import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown } from 'lucide-react';
import NeonCtaButton from '../NeonCtaButton/NeonCtaButton';
import { createVideoScrollSeeker } from '../../utils/videoScrollSeek';
import styles from './ScrollVideo.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollVideo({ videoSrc }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const scrollHintRef = useRef(null);

  const [shouldLoad, setShouldLoad] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const isLoaded = loadedSrc === videoSrc;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    if (!('IntersectionObserver' in window)) {
      const fallbackTimer = window.setTimeout(() => setShouldLoad(true), 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '2000px 0px' },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    const onReady = () => {
      video.removeEventListener('loadeddata', onReady);
      video.pause();
      setLoadedSrc(videoSrc);
    };

    video.addEventListener('loadeddata', onReady, { once: true });
    video.src = videoSrc;
    video.load();

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      onReady();
    }

    return () => {
      video.removeEventListener('loadeddata', onReady);
      video.removeAttribute('src');
      video.load();
    };
  }, [shouldLoad, videoSrc]);

  useGSAP(
    () => {
      if (!isLoaded || !videoRef.current || !containerRef.current) return undefined;

      const video = videoRef.current;
      const duration = video.duration;

      if (!duration || Number.isNaN(duration)) return undefined;

      const seeker = createVideoScrollSeeker(video);
      seeker.setDuration(duration);

      const setHintOpacity = scrollHintRef.current
        ? gsap.quickTo(scrollHintRef.current, 'opacity', {
            duration: 0.25,
            ease: 'power2.out',
          })
        : null;
      let isHintHidden = false;

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
        fastScrollEnd: 2500,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          seeker.seek(self.progress, self.getVelocity());

          const shouldHideHint = self.progress > 0.03;
          if (setHintOpacity && shouldHideHint !== isHintHidden) {
            isHintHidden = shouldHideHint;
            setHintOpacity(shouldHideHint ? 0 : 1);
          }
        },
      });

      gsap.to(scrollHintRef.current, {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'power1.inOut',
      });

      return () => {
        seeker.dispose();
        trigger.kill();
      };
    },
    [isLoaded],
    { scope: containerRef },
  );

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={`${styles.stickyContainer} ${styles.videoStickyContainer}`}>
        <div className={styles.videoCard}>
          {!isLoaded && (
            <div className={styles.loader}>Loading Video Buffer...</div>
          )}

          <video
            ref={videoRef}
            className={styles.video}
            playsInline
            muted
            preload={shouldLoad ? 'auto' : 'none'}
            disablePictureInPicture
            style={{ opacity: isLoaded ? 1 : 0 }}
          />
        </div>

        {/* Scroll Hint */}
        <div ref={scrollHintRef} className={styles.scrollHint}>
          <span>Scroll</span>

          <div className={styles.scrollArrow}>
            <ChevronDown size={18} strokeWidth={2} />
          </div>
        </div>

        <div className={styles.exploreBtnWrap}>
          <NeonCtaButton>Try Now</NeonCtaButton>
        </div>
      </div>
    </div>
  );
}
