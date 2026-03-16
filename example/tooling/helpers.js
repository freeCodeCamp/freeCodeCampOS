import { exec } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const execute = promisify(exec);

// ROOT is injected as a global by the test runner, but falls back to cwd
// when this module is loaded outside the runner (e.g. directly via Node).
const ROOT = globalThis.ROOT ?? process.cwd();

async function getFile(filePath) {
  return readFileSync(join(ROOT, filePath), 'utf-8');
}

async function getCommandOutput(command, path = '') {
  return execute(command, { cwd: join(ROOT, path), shell: '/bin/bash' });
}

export async function javascriptTest(filePath, test, cb) {
  const PATH_TO_FILE = join(ROOT, filePath);
  const testString = `\n${test}`;

  const fileContents = await getFile(filePath);

  const fileWithTest = fileContents + '\n' + testString;

  let std;

  try {
    writeFileSync(PATH_TO_FILE, fileWithTest, 'utf-8');

    std = await getCommandOutput(`node ${PATH_TO_FILE}`);
  } catch (e) {
    console.debug(e);
  } finally {
    writeFileSync(PATH_TO_FILE, fileContents, 'utf-8');
    await cb(std?.stdout ?? '', std?.stderr ?? '');
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

export function testDynamicHelper() {
  return 'Helper success!';
}
