import { cp } from 'fs/promises';
import { join } from 'path';

const ROOT = process.env.INIT_CWD;

console.log('--- TEST ---');
console.log('init_cwd: ', process.env.INIT_CWD);
copyDotFreeCodeCampToRoot();
console.log('--- TEST ---');

async function copyDotFreeCodeCampToRoot() {
  await cp(
    join(ROOT, 'node_modules/freecodecamp-os/.freeCodeCamp'),
    join(ROOT, '.freeCodeCamp'),
    {
      recursive: true,
      force: true
    }
  );
}
