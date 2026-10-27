import path from 'node:path';
import fs from 'node:fs';
import { runFfmpeg } from './ffmpegRunner.js';

async function extractFrames(inputName, outputFolderName, fps = 15) {
  const inputPath = path.resolve(process.cwd(), 'src/assets/videos', inputName);
  const outputDirectory = path.resolve(process.cwd(), 'public/frames', outputFolderName);
  fs.mkdirSync(outputDirectory, { recursive: true });

  const outputPath = path.join(outputDirectory, 'frame_%04d.webp');
  console.log(`Starting mobile frame extraction for ${outputFolderName}...`);

  await runFfmpeg([
    '-y',
    '-i', inputPath,
    '-r', String(fps),
    '-vf', 'scale=480:-2',
    '-c:v', 'libwebp',
    '-q:v', '50',
    '-f', 'image2',
    outputPath,
  ]);

  console.log(`Finished extracting frames for ${outputFolderName}`);
}

async function main() {
  try {
    await extractFrames('vid1.mp4', 'vid1_mobile', 24);
    await extractFrames('vid2.mp4', 'vid2_mobile', 24);
    console.log('All frame extraction completed.');
  } catch (error) {
    console.error('Failed processing media.', error);
    process.exitCode = 1;
  }
}

main();
