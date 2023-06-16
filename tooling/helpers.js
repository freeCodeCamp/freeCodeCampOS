import __helpers from '../node_modules/@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/test-utils.js';
import { logover } from '../node_modules/@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/logger.js';
import { ROOT } from '../node_modules/@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/env.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function javascriptTest(filePath, test, cb) {
  const PATH_TO_FILE = join(ROOT, filePath);
  const testString = `\n${test}`;

  const fileContents = await __helpers.getFile(filePath);

  const fileWithTest = fileContents + '\n' + testString;

  let std;

  try {
    writeFileSync(PATH_TO_FILE, fileWithTest, 'utf-8');

    std = await __helpers.getCommandOutput(`node ${PATH_TO_FILE}`);
  } catch (e) {
    logover.debug(e);
  } finally {
    const ensureFileContents = fileContents.replace(testString, '');
    writeFileSync(PATH_TO_FILE, ensureFileContents, 'utf-8');
    await cb(std.stdout, std.stderr);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

export function testDynamicHelper() {
  return 'Helper success!';
}
