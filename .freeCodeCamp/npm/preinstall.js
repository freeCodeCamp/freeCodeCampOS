import {cp} from "fs/promises";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PATHS_TO_COPY = [
  "client", "tooling", "tsconfig.json", "webpack.config.cjs"
]

console.log("--- TEST ---");
console.log("__dirname: ", __dirname);
// console.log("ROOT: ", ROOT);
// copyDotFreeCodeCampToRoot();
console.log("--- TEST ---");


async function copyDotFreeCodeCampToRoot() {
  await cp('.freeCodeCamp', ".freeCodeCamp", {recursive: true, force: true});
}