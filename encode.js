import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic);

const encodeVideo = (inputName, outputName) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(process.cwd(), 'src/assets/videos', inputName);
    const outputPath = path.join(process.cwd(), 'src/assets/videos', outputName);
    
    console.log(`Starting encoding for ${inputName}...`);
    ffmpeg(inputPath)
      .outputOptions([
        '-vcodec libx264',
        '-x264-params keyint=1', // The magic flag to put a keyframe on every single frame!
        '-acodec copy', // copy audio just in case
      ])
      .on('end', () => {
        console.log(`Finished encoding ${outputName}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error encoding ${inputName}:`, err);
        reject(err);
      })
      .save(outputPath);
  });
};

async function main() {
  try {
    await encodeVideo('vid1.mp4', 'vid1-kf.mp4');
    await encodeVideo('vid2.mp4', 'vid2-kf.mp4');
    console.log('All encoding completed!');
  } catch (error) {
    console.error('Failed encoding videos.');
  }
}

main();
