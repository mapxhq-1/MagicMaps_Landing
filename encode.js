import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic);

const encodeVideo = (inputName, outputName, videoFilter) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(process.cwd(), 'src/assets/videos', inputName);
    const outputPath = path.join(process.cwd(), 'src/assets/videos', outputName);

    console.log(`Starting encoding for ${outputName}...`);

    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset slow',
        '-crf 28',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-g 1',
        '-keyint_min 1',
        '-sc_threshold 0',
        `-vf ${videoFilter}`,
        '-r 30',
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

async function main() {
  try {
    // Desktop encodes (1600px wide)
    await encodeVideo('vid1.mp4', 'vid1-kf.mp4', 'scale=1600:-2');
    await encodeVideo('vid2.mp4', 'vid2-kf.mp4', 'scale=1600:-2');
    
    // Mobile encodes (Cropped to center 9:16, scaled to 720px wide)
    await encodeVideo('vid1.mp4', 'vid1-mobile-kf.mp4', "crop='floor(ih*9/16/2)*2':ih,scale=720:-2");
    await encodeVideo('vid2.mp4', 'vid2-mobile-kf.mp4', "crop='floor(ih*9/16/2)*2':ih,scale=720:-2");
    
    console.log('All encoding completed!');
  } catch (error) {
    console.error('Failed encoding videos.', error);
  }
}

main();