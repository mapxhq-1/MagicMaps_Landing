import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NeonCtaButton from '../NeonCtaButton/NeonCtaButton';

gsap.registerPlugin(ScrollTrigger);

const BODY_FONT = 'var(--quote-display)';
const ATTR_FONT = 'var(--sans)';

function splitWordsIntoSpans(text, keyPrefix, variant) {
  return text.split(/(\s+)/).map((word, index) => {
    if (word.match(/^\s+$/)) {
      if (word.includes('\n')) return <br key={`${keyPrefix}-${index}`} />;
      return word;
    }

    const baseStyle = { display: 'inline-block' };
    const bodyStyle =
      variant === 'body'
        ? {
          ...baseStyle,
          fontFamily: BODY_FONT,
          fontWeight: 500,
          color: 'var(--text-h)',
        }
        : {
          ...baseStyle,
          fontFamily: ATTR_FONT,
          fontWeight: 600,
          color: 'var(--text-h)',
        };

    return (
      <span className="word" style={bodyStyle} key={`${keyPrefix}-${index}`}>
        {word}
      </span>
    );
  });
}

/**
 * Scroll-driven reveal matched to ScrollVideo pattern:
 * one timeline + one ScrollTrigger on the outer section (triggerRef),
 * start 'top top' → end 'bottom bottom', scrub — scroll maps to progress (bidirectional).
 *
 * If children contains a final line after `\n` (e.g. "— Magic Maps"), it renders
 * smaller and right-aligned; body is continuous flowing copy (wraps only when the viewport requires it).
 */
const ScrollReveal = ({
  children,
  scrollContainerRef,
  triggerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  attributionClassName = 'quote-attribution',
  scrollStart = 'top top',
  scrollEnd = 'bottom bottom',
  scrub = 0.5,
  textSize = 'clamp(2rem, 5vw, 4rem)',
  textWeight = 500,
  textLineHeight = 1.4,
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    const nlIdx = text.lastIndexOf('\n');
    const mainRaw = nlIdx >= 0 ? text.slice(0, nlIdx) : text;
    const attrRaw = nlIdx >= 0 ? text.slice(nlIdx + 1).trim() : '';

    const bodySpans = splitWordsIntoSpans(mainRaw, 'body', 'body');

    if (!attrRaw) {
      return bodySpans;
    }

    const attrSpans = splitWordsIntoSpans(attrRaw, 'attr', 'attr');

    return (
      <>
        {bodySpans}
        <br key="quote-br-attr" />
        <span className={attributionClassName}>{attrSpans}</span>
      </>
    );
  }, [attributionClassName, children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const triggerEl = triggerRef && triggerRef.current ? triggerRef.current : el;

    const ctx = gsap.context(() => {
      const wordElements = el.querySelectorAll('.word');
      if (!wordElements.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub,
        },
      });

      if (baseRotation !== 0) {
        tl.fromTo(
          el,
          { transformOrigin: '50% 50%', rotate: baseRotation },
          { rotate: 0, duration: 1, ease: 'none' },
          0,
        );
      }

      const fromState = {
        opacity: baseOpacity,
        y: 150,
        z: -400,
        rotationX: -120,
        force3D: true,
      };
      const toState = {
        opacity: 1,
        y: 0,
        z: 0,
        rotationX: 0,
        stagger: 0.06,
        ease: 'none',
      };

      if (enableBlur) {
        fromState.filter = `blur(${blurStrength}px)`;
        toState.filter = 'blur(0px)';
      }

      tl.fromTo(wordElements, fromState, toState, 0);
    }, el);

    return () => ctx.revert();
  }, [
    scrollContainerRef,
    triggerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    blurStrength,
    scrollStart,
    scrollEnd,
    scrub,
    children,
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
      <h2 ref={containerRef} style={{ margin: '2rem 0', perspective: '1000px' }} className={containerClassName}>
        <p
          style={{
            fontSize: textSize,
            lineHeight: textLineHeight,
            fontWeight: textWeight,
            fontFamily: BODY_FONT,
          }}
          className={textClassName}
        >
          {splitText}
        </p>
      </h2>
      <div style={{ marginTop: '3rem' }}>
        <NeonCtaButton>Try Now</NeonCtaButton>
      </div>
    </div>
  );
};

export default ScrollReveal;