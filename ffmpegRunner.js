import { spawn } from 'node:child_process';

export function runFfmpeg(args) {
  const executable = process.env.FFMPEG_PATH || 'ffmpeg';

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { stdio: 'inherit' });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}
