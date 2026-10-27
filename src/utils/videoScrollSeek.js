/**
 * Coalesces scroll updates so only the latest target is sought after the
 * previous seek completes. This keeps rapid scrolling from repeatedly
 * interrupting the browser's video decoder.
 */
export function createVideoScrollSeeker(video) {
  let duration = 0;
  let pendingProgress = null;
  let pendingVelocity = 0;
  let rafId = null;
  let seekInFlight = false;
  let disposed = false;

  const epsilonForVelocity = (velocity) => {
    const v = Math.abs(velocity);
    if (v > 4000) return 0.12;
    if (v > 2000) return 0.07;
    if (v > 800) return 0.04;
    return 0.025;
  };

  const scheduleFlush = () => {
    if (disposed || seekInFlight || rafId || pendingProgress == null) return;
    rafId = requestAnimationFrame(flush);
  };

  const flush = () => {
    rafId = null;

    if (
      disposed ||
      seekInFlight ||
      video.seeking ||
      pendingProgress == null ||
      !duration
    ) {
      return;
    }

    const progress = pendingProgress;
    const velocity = pendingVelocity;
    pendingProgress = null;
    pendingVelocity = 0;

    const targetTime = progress * duration;
    const epsilon = epsilonForVelocity(velocity);

    if (Math.abs(video.currentTime - targetTime) <= epsilon) {
      scheduleFlush();
      return;
    }

    seekInFlight = true;

    try {
      video.currentTime = targetTime;
    } catch {
      seekInFlight = false;
      scheduleFlush();
    }
  };

  const onSeeked = () => {
    seekInFlight = false;
    scheduleFlush();
  };

  video.addEventListener('seeked', onSeeked);

  return {
    setDuration(value) {
      duration = Number.isFinite(value) && value > 0 ? value : 0;
    },
    seek(progress, velocity = 0) {
      if (disposed || !Number.isFinite(progress)) return;

      pendingProgress = Math.min(1, Math.max(0, progress));
      pendingVelocity = Math.abs(velocity);
      scheduleFlush();
    },
    dispose() {
      disposed = true;
      video.removeEventListener('seeked', onSeeked);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      pendingProgress = null;
      pendingVelocity = 0;
      seekInFlight = false;
    },
  };
}
