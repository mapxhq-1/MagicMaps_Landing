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

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const onReady = () => {
      video.pause();
      setIsLoaded(true);
    };

    video.src = videoSrc;
    video.load();

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      onReady();
    } else {
      video.addEventListener('canplaythrough', onReady, { once: true });
    }

    return () => {
      video.removeEventListener('canplaythrough', onReady);
      video.removeAttribute('src');
      video.load();
    };
  }, [videoSrc]);

  useGSAP(
    () => {
      if (!isLoaded || !videoRef.current || !containerRef.current) return undefined;

      const video = videoRef.current;
      const duration = video.duration;

      if (!duration || Number.isNaN(duration)) return undefined;

      const seeker = createVideoScrollSeeker(video);
      seeker.setDuration(duration);

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

          if (scrollHintRef.current) {
            gsap.to(scrollHintRef.current, {
              opacity: self.progress > 0.03 ? 0 : 1,
              duration: 0.25,
              ease: 'power2.out',
            });
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
            preload="auto"
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