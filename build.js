#!/usr/bin/env node
// Simple build script - copies www/ to dist/ and can be extended
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = path.join(__dirname, 'www');
const destDir = path.join(__dirname, 'dist');

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true });
}

copyDir(srcDir, destDir);
console.log('Build complete: www/ -> dist/');
