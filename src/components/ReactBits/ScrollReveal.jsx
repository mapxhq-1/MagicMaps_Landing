import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 4,
    containerClassName = '',
    textClassName = '',
    rotationEnd = 'bottom center',
    wordAnimationEnd = 'bottom 40%'
}) => {
    const containerRef = useRef(null);

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';
        return text.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) {
                if (word.includes('\n')) return <br key={index} />;
                return word;
            }

            const isMagic = word.includes('Magic') || word.includes('Maps');
            const baseStyle = { display: 'inline-block' };
            const magicStyle = isMagic
                ? {
                    fontFamily: "'General Sans', sans-serif",
                    fontWeight: 600,
                    color: '#000',
                    textTransform: 'none',
                    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                    opacity: 0.8
                }
                : { color: 'var(--text-h)' };

            return (
                <span className="word" style={{ ...baseStyle, ...magicStyle }} key={index}>
                    {word}
                </span>
            );
        });
    }, [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

        gsap.fromTo(
            el,
            { transformOrigin: '0% 50%', rotate: baseRotation },
            {
                ease: 'none',
                rotate: 0,
                scrollTrigger: {
                    trigger: el,
                    scroller,
                    start: 'top 70%',
                    end: rotationEnd,
                    scrub: true
                }
            }
        );

        const wordElements = el.querySelectorAll('.word');

        gsap.fromTo(
            wordElements,
            { opacity: baseOpacity, y: 150, z: -400, rotationX: -120, willChange: 'opacity, transform' },
            {
                ease: 'power2.out',
                opacity: 1,
                y: 0,
                z: 0,
                rotationX: 0,
                stagger: 0.05,
                scrollTrigger: {
                    trigger: el,
                    scroller,
                    start: 'top 70%',
                    end: wordAnimationEnd,
                    scrub: true
                }
            }
        );

        if (enableBlur) {
            gsap.fromTo(
                wordElements,
                { filter: `blur(${blurStrength}px)` },
                {
                    ease: 'power2.out',
                    filter: 'blur(0px)',
                    stagger: 0.03,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: 'top 70%',
                        end: wordAnimationEnd,
                        scrub: true
                    }
                }
            );
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

    return (
        <h2 ref={containerRef} style={{ margin: '2rem 0', perspective: '1000px' }} className={containerClassName}>
            <p style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.4, fontWeight: 500 }} className={textClassName}>
                {splitText}
            </p>
        </h2>
    );
};

export default ScrollReveal;
