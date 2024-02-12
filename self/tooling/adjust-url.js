//! This script adjusts the preview URL for freeCodeCamp - Courses to open the correct preview.
import { readFile, writeFile } from 'fs/promises';

let PREVIEW_URL = 'http://localhost:8080';
if (process.env.GITPOD_WORKSPACE_URL) {
  PREVIEW_URL = `https://8080-${
    process.env.GITPOD_WORKSPACE_URL.split('https://')[1]
  }`;
} else if (process.env.CODESPACE_NAME) {
  PREVIEW_URL = `https://${process.env.CODESPACE_NAME}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
}

const VSCODE_SETTINGS_PATH = '.vscode/settings.json';

async function main() {
  const settings_file = await readFile(VSCODE_SETTINGS_PATH, 'utf-8');
  const settings = JSON.parse(settings_file);

  let [preview] = settings?.['freecodecamp-courses.workspace.previews'];
  if (!preview.url) {
    throw new Error('.vscode setting not found');
  }
  preview.url = PREVIEW_URL;

  await writeFile(
    VSCODE_SETTINGS_PATH,
    JSON.stringify(settings, null, 2),
    'utf-8'
  );
}

try {
  main();
} catch (e) {
  console.error('Unable to adjust .vscode/settings.json preview url setting:');
  console.error(e);
}
