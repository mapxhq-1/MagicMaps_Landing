/**
 * Batches video.currentTime updates to one seek per animation frame.
 * Skips micro-seeks during fast wheel scroll using velocity-aware epsilon.
 */
export function createVideoScrollSeeker(video) {
  let duration = 0;
  let pendingProgress = null;
  let pendingVelocity = 0;
  let rafId = null;

  const epsilonForVelocity = (velocity) => {
    const v = Math.abs(velocity);
    if (v > 4000) return 0.12;
    if (v > 2000) return 0.07;
    if (v > 800) return 0.04;
    return 0.025;
  };

  const flush = () => {
    rafId = null;
    if (pendingProgress == null || !video || !duration) return;

    const progress = pendingProgress;
    const velocity = pendingVelocity;
    pendingProgress = null;
    pendingVelocity = 0;

    const targetTime = progress * duration;
    const epsilon = epsilonForVelocity(velocity);

    if (Math.abs(video.currentTime - targetTime) > epsilon) {
      video.currentTime = targetTime;
    }
  };

  return {
    setDuration(value) {
      duration = value;
    },
    seek(progress, velocity = 0) {
      pendingProgress = progress;
      pendingVelocity = Math.max(pendingVelocity, Math.abs(velocity));
      if (!rafId) {
        rafId = requestAnimationFrame(flush);
      }
    },
    dispose() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      pendingProgress = null;
      pendingVelocity = 0;
    },
  };
}
