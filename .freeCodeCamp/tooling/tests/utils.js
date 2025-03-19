import { spawn } from 'node:child_process';

/**
 * Runs the provided Python code.
 *
 * If the python code raises an error, this function rejects with that error as a string.
 * Otherwise, resolves with the python process stdout.
 *
 * @param {string} code
 */
export async function runPython(code) {
  const child = spawn('python3', ['-c', code]);

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', data => {
    process.stdout.write(data);
    stdout += data;
  });

  child.stderr.on('data', data => {
    stderr += data;
  });

  return new Promise((resolve, reject) => {
    child.on('close', code => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(stderr);
      }
    });
  });
}
