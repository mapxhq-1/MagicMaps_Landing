import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs'; // Added to create directories

ffmpeg.setFfmpegPath(ffmpegStatic);

// 1. Desktop Video Encoder
const encodeVideo = (inputName, outputName, options) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(process.cwd(), 'src/assets/videos', inputName);
    const outputPath = path.join(process.cwd(), 'src/assets/videos', outputName);

    const { videoFilter, fps = 30, crf = 28 } = options;

    console.log(`Starting Desktop encoding for ${outputName} at ${fps}fps, CRF ${crf}...`);

    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset slow',
        `-crf ${crf}`,
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-g 1',
        '-keyint_min 1',
        '-sc_threshold 0',
        `-vf ${videoFilter}`,
        `-r ${fps}`,
        '-vsync cfr',
        '-an'
      ])
      .on('end', () => {
        console.log(`Finished encoding ${outputName}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error encoding ${outputName}:`, err);
        reject(err);
      })
      .save(outputPath);
  });
};

const extractFrames = (inputName, outputFolderName, fps = 15) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.resolve(process.cwd(), 'src/assets/videos', inputName);
    const absoluteOutputDir = path.resolve(process.cwd(), 'public/frames', outputFolderName);

    if (!fs.existsSync(absoluteOutputDir)) {
      fs.mkdirSync(absoluteOutputDir, { recursive: true });
    }

    // UPDATE HERE: Change %03d to %04d
    const outputPath = path.join(absoluteOutputDir, 'frame_%04d.jpg').replace(/\\/g, '/');

    console.log(`Starting Mobile frame extraction for ${outputFolderName}...`);

    ffmpeg(inputPath)
      .outputOptions([
        `-r ${fps}`,
        '-vf crop=floor(ih*9/16/2)*2:ih,scale=480:-2',
        '-q:v 2',
        '-f image2'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('\n--- EXECUTING RAW FFMPEG COMMAND ---');
        console.log(commandLine);
        console.log('------------------------------------\n');
      })
      .on('end', () => {
        console.log(`✅ Finished extracting frames for ${outputFolderName}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ Error extracting frames for ${outputFolderName}:`, err);
        reject(err);
      })
      .run();
  });
};

// 3. Main Execution
async function main() {
  try {
    // Desktop encodes (1600px wide, 30fps, CRF 28)
    const desktopOptions = {
      videoFilter: 'scale=1600:-2',
      fps: 30,
      crf: 28
    };
    // await encodeVideo('vid1.mp4', 'vid1-kf.mp4', desktopOptions);
    // await encodeVideo('vid2.mp4', 'vid2-kf.mp4', desktopOptions);

    // Mobile encodes (Extracting WebP images instead of making an MP4)
    await extractFrames('vid1.mp4', 'vid1_mobile', 24);
    await extractFrames('vid2.mp4', 'vid2_mobile', 24);

    console.log('All encoding and extraction completed!');
  } catch (error) {
    console.error('Failed processing media.', error);
  }
}

main();