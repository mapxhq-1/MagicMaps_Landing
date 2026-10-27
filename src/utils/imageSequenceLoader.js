const clampFrame = (index, frameCount) =>
  Math.max(0, Math.min(frameCount - 1, index));

async function decodeFrame(src, signal) {
  if ('createImageBitmap' in window) {
    const response = await fetch(src, { signal });
    if (!response.ok) {
      throw new Error(`Unable to load frame: ${response.status}`);
    }
    return createImageBitmap(await response.blob());
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load frame'));
    image.src = src;

    signal.addEventListener(
      'abort',
      () => {
        image.onload = null;
        image.onerror = null;
        image.removeAttribute('src');
        reject(new DOMException('Frame load aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

/**
 * Keeps a small decoded window around the current scroll position. Requests are
 * coalesced so a fast scroll immediately prioritizes the newest target instead
 * of making the browser finish a stale queue of hundreds of frames.
 */
export function createImageSequenceLoader({
  frameCount,
  getFrameSources,
  onFrameReady,
  concurrency = 4,
  maxCachedFrames = 96,
}) {
  const cache = new Map();
  const inFlight = new Set();
  const failed = new Set();
  const controller = new AbortController();

  let queue = [];
  let disposed = false;
  let centerFrame = 0;

  const closeFrame = (frame) => {
    if (typeof frame?.close === 'function') frame.close();
  };

  const evictDistantFrames = () => {
    if (cache.size <= maxCachedFrames) return;

    const removable = [...cache.keys()]
      .filter((index) => index !== 0 && index !== centerFrame)
      .sort(
        (a, b) =>
          Math.abs(b - centerFrame) - Math.abs(a - centerFrame),
      );

    while (cache.size > maxCachedFrames && removable.length) {
      const index = removable.shift();
      closeFrame(cache.get(index));
      cache.delete(index);
    }
  };

  const load = async (index) => {
    inFlight.add(index);
    const sources = getFrameSources(index);

    try {
      let frame = null;
      for (const src of sources) {
        try {
          frame = await decodeFrame(src, controller.signal);
          break;
        } catch (error) {
          if (error?.name === 'AbortError') throw error;
        }
      }

      if (!frame) throw new Error('No frame source could be decoded');

      if (disposed) {
        closeFrame(frame);
        return;
      }

      cache.set(index, frame);
      failed.delete(index);
      evictDistantFrames();
      onFrameReady?.(index, frame);
    } catch (error) {
      if (error?.name !== 'AbortError') failed.add(index);
    } finally {
      inFlight.delete(index);
      pump();
    }
  };

  function pump() {
    if (disposed) return;

    while (inFlight.size < concurrency && queue.length) {
      const index = queue.shift();
      if (cache.has(index) || inFlight.has(index) || failed.has(index)) {
        continue;
      }
      load(index);
    }
  }

  const requestWindow = (targetIndex, direction = 1) => {
    centerFrame = clampFrame(targetIndex, frameCount);

    const forward = direction < 0 ? 16 : 48;
    const backward = direction < 0 ? 48 : 16;
    const requested = [centerFrame];

    for (let offset = 1; offset <= Math.max(forward, backward); offset += 1) {
      if (offset <= forward) {
        requested.push(clampFrame(centerFrame + offset, frameCount));
      }
      if (offset <= backward) {
        requested.push(clampFrame(centerFrame - offset, frameCount));
      }
    }

    // Replacing the queue is intentional: it drops stale, not-yet-started work
    // after a fast jump while allowing the small in-flight set to finish.
    queue = [...new Set(requested)].filter(
      (index) => !cache.has(index) && !inFlight.has(index) && !failed.has(index),
    );
    pump();
  };

  const getClosestFrame = (targetIndex) => {
    const target = clampFrame(targetIndex, frameCount);
    if (cache.has(target)) return { index: target, frame: cache.get(target) };

    for (let radius = 1; radius < frameCount; radius += 1) {
      const before = target - radius;
      const after = target + radius;
      if (before >= 0 && cache.has(before)) {
        return { index: before, frame: cache.get(before) };
      }
      if (after < frameCount && cache.has(after)) {
        return { index: after, frame: cache.get(after) };
      }
    }

    return null;
  };

  return {
    requestWindow,
    getClosestFrame,
    dispose() {
      disposed = true;
      queue = [];
      controller.abort();
      cache.forEach(closeFrame);
      cache.clear();
      inFlight.clear();
    },
  };
}
