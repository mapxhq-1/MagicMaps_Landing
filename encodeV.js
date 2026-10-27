import path from 'node:path';
import { runFfmpeg } from './ffmpegRunner.js';

async function encodeVideo(inputName, outputName) {
  const inputPath = path.resolve(process.cwd(), 'src/assets/videos', inputName);
  const outputPath = path.resolve(process.cwd(), 'src/assets/videos', outputName);

  console.log(`Starting encoding for ${inputName}...`);
  await runFfmpeg([
    '-y',
    '-i', inputPath,
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-g', '6',
    '-keyint_min', '6',
    '-sc_threshold', '0',
    '-vf', 'scale=1600:-2',
    '-r', '30',
    '-fps_mode', 'cfr',
    '-an',
    outputPath,
  ]);
  console.log(`Finished encoding ${outputName}`);
}

async function main() {
  try {
    await encodeVideo('vid1.mp4', 'vid1-kf.mp4');
    await encodeVideo('vid2.mp4', 'vid2-kf.mp4');
    console.log('All encoding completed.');
  } catch (error) {
    console.error('Failed encoding videos.', error);
    process.exitCode = 1;
  }
}

main();
