import {readFile} from "fs/promises";
import {join} from "path";
import { ROOT } from "../env.js";

export async function getConfig() {
  const config = await readFile(join(ROOT, 'freecodecamp.conf.json'), 'utf-8');
  return JSON.parse(config);
}

