import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import NeonCtaButton from '../NeonCtaButton/NeonCtaButton'; // Adjust path if needed
import styles from './ScrollVideo.module.css'; // Reusing the same CSS

gsap.registerPlugin(ScrollTrigger);

export default function ScrollImageSequence({ frameCount, framePath }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [loadedImages, setLoadedImages] = useState(0);
    const imagesRef = useRef([]);

    useEffect(() => {
        const images = [];
        let loadedCount = 0;

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            // Pad index to match FFmpeg output (e.g., 001, 002)
            const paddedIndex = String(i).padStart(4, '0');
            img.src = `${framePath}${paddedIndex}.jpg`;

            img.onload = () => {
                loadedCount++;
                setLoadedImages(loadedCount);

                // Draw the very first frame immediately once it loads
                if (i === 1 && canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
            };

            images.push(img);
        }

        imagesRef.current = images;
    }, [frameCount, framePath]);

    useGSAP(() => {
        if (loadedImages < frameCount || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const images = imagesRef.current;

        ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.1,
            onUpdate: (self) => {
                const frameIndex = Math.min(
                    frameCount - 1,
                    Math.floor(self.progress * frameCount)
                );

                const img = images[frameIndex];

                if (img && img.complete) {
                    requestAnimationFrame(() => {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    });
                }
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [loadedImages, frameCount], { scope: containerRef });

    const progressPercentage = Math.round((loadedImages / frameCount) * 100);

    return (
        <div className={styles.scrollContainer} ref={containerRef}>
            <div className={styles.stickyContainer}>

                {loadedImages < frameCount && (
                    <div className={styles.loader}>
                        Loading Experience... {progressPercentage}%
                    </div>
                )}

                
                <canvas
          ref={canvasRef}
          className={styles.video}
          style={{ 
            opacity: loadedImages >= frameCount ? 1 : 0,
            
            // Add these three lines to create the top/bottom spaces:
            width: '100%', 
            height: '100vh', 
            objectFit: 'contain' 
          }}
        ></canvas>

                <div className={styles.exploreBtnWrap}>
                    <NeonCtaButton>Try Now</NeonCtaButton>
                </div>
            </div>
        </div>
    );
}