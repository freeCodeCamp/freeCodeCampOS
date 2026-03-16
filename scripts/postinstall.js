#!/usr/bin/env node
'use strict';

const { createWriteStream, chmodSync, existsSync, mkdirSync } = require('fs');
const { get } = require('https');
const { join } = require('path');
const { version } = require('../package.json');

// Don't run when doing `bun i` / `npm i` inside this workspace
if (!__dirname.includes('node_modules')) {
  process.exit(0);
}

const PLATFORM_MAP = {
  'linux-x64': 'x86_64-unknown-linux-gnu',
  'darwin-x64': 'x86_64-apple-darwin',
  'darwin-arm64': 'aarch64-apple-darwin',
};

const key = `${process.platform}-${process.arch}`;
const target = PLATFORM_MAP[key];

if (!target) {
  console.warn(`freecodecamp-os: no pre-built binary for ${key}, skipping install.`);
  process.exit(0);
}

const binDir = join(__dirname, '..', 'bin');
const binPath = join(binDir, 'freecodecamp-server');
const url = `https://github.com/freeCodeCamp/freeCodeCampOS/releases/download/v${version}/freecodecamp-server-${target}`;

mkdirSync(binDir, { recursive: true });

// Binary was bundled with the published package — copy the platform binary into place
const bundledBin = join(binDir, `freecodecamp-server-${target}`);
if (existsSync(bundledBin)) {
  require('fs').copyFileSync(bundledBin, binPath);
  chmodSync(binPath, 0o755);
  console.log('freecodecamp-os: installed bundled binary for', target);
  process.exit(0);
}

function download(url, dest, cb) {
  get(url, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      return download(res.headers.location, dest, cb);
    }
    if (res.statusCode !== 200) {
      return cb(new Error(`HTTP ${res.statusCode} for ${url}`));
    }
    const file = createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => file.close(cb));
    file.on('error', cb);
  }).on('error', cb);
}

console.log(`freecodecamp-os: downloading binary for ${target}...`);
download(url, binPath, (err) => {
  if (err) {
    console.error('freecodecamp-os: failed to download binary:', err.message);
    process.exit(1);
  }
  chmodSync(binPath, 0o755);
  console.log('freecodecamp-os: installed to', binPath);
});
