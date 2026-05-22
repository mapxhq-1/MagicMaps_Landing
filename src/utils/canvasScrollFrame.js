/**
 * Batches canvas frame draws to one paint per animation frame during scroll.
 */
export function createCanvasScrollRenderer(drawFrame) {
  let pendingProgress = null;
  let pendingVelocity = 0;
  let rafId = null;
  let lastFrameIndex = -1;

  const flush = () => {
    rafId = null;
    if (pendingProgress == null) return;

    const progress = pendingProgress;
    const velocity = pendingVelocity;
    pendingProgress = null;
    pendingVelocity = 0;

    const frameIndex = drawFrame(progress, velocity, lastFrameIndex);
    if (frameIndex >= 0) {
      lastFrameIndex = frameIndex;
    }
  };

  return {
    render(progress, velocity = 0) {
      pendingProgress = progress;
      pendingVelocity = Math.max(pendingVelocity, Math.abs(velocity));
      if (!rafId) {
        rafId = requestAnimationFrame(flush);
      }
    },
    reset() {
      lastFrameIndex = -1;
    },
    dispose() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      pendingProgress = null;
      pendingVelocity = 0;
      lastFrameIndex = -1;
    },
  };
}
