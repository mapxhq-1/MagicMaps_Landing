import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Threads = lazy(() => import('./Threads'));

export default function DeferredThreads(props) {
  const containerRef = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window)) {
      const fallbackTimer = window.setTimeout(() => setShouldMount(true), 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldMount(true);
        observer.disconnect();
      },
      { rootMargin: '1200px 0px' },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="threads-wrap">
      {shouldMount && (
        <Suspense fallback={null}>
          <Threads {...props} />
        </Suspense>
      )}
    </div>
  );
}
