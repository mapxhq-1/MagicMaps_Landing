import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic);

const encodeVideo = (inputName, outputName, options) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(process.cwd(), 'src/assets/videos', inputName);
    const outputPath = path.join(process.cwd(), 'src/assets/videos', outputName);

    // Extract options with sensible defaults for desktop
    const {
      videoFilter,
      fps = 30,
      crf = 28,
      isMobile = false
    } = options;

    console.log(`Starting encoding for ${outputName} at ${fps}fps, CRF ${crf}...`);

    let outputOptions = [
      '-c:v libx264',
      '-preset slow',
      `-crf ${crf}`,
      '-pix_fmt yuv420p',
      '-movflags +faststart',

      // Keyframe every frame (Necessary for scroll-scrubbing, but very heavy)
      '-g 1',
      '-keyint_min 1',
      '-sc_threshold 0',

      `-vf ${videoFilter}`,
      `-r ${fps}`,
      '-vsync cfr',
      '-an' // Mute audio
    ];

    // Add mobile-specific constraints for easier hardware decoding
    if (isMobile) {
      outputOptions.push(
        '-profile:v main',
        '-level 3.1'
      );
    }

    ffmpeg(inputPath)
      .outputOptions(outputOptions)
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

async function main() {
  try {
    // Desktop encodes (1600px wide, 30fps, CRF 28)
    const desktopOptions = {
      videoFilter: 'scale=1600:-2',
      fps: 30,
      crf: 28,
      isMobile: false
    };
    await encodeVideo('vid1.mp4', 'vid1-kf.mp4', desktopOptions);
    await encodeVideo('vid2.mp4', 'vid2-kf.mp4', desktopOptions);

    // Mobile encodes (Cropped to center 9:16, scaled to 480px wide, 24fps, CRF 32)
    const mobileOptions = {
      videoFilter: "crop='floor(ih*9/16/2)*2':ih,scale=480:-2", // Lowered from 720 to 480
      fps: 24, // Lowered from 30 to 24 for smoothness/size
      crf: 32, // Increased compression (lower quality, much smaller size)
      isMobile: true
    };
    await encodeVideo('vid1.mp4', 'vid1-mobile-kf.mp4', mobileOptions);
    await encodeVideo('vid2.mp4', 'vid2-mobile-kf.mp4', mobileOptions);

    console.log('All encoding completed!');
  } catch (error) {
    console.error('Failed encoding videos.', error);
  }
}

main();