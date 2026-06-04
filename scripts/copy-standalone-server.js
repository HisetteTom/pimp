const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../server.js');
const destDir = path.join(__dirname, '../.next/standalone');
const dest = path.join(destDir, 'server.js');

try {
  if (!fs.existsSync(destDir)) {
    console.log('> Standalone directory does not exist. Did the build fail?');
    process.exit(1);
  }

  // Copy custom server.js to standalone directory
  fs.copyFileSync(src, dest);
  console.log(`> Successfully copied custom server.js to ${dest}`);

  // Standalone also requires static files and public directory to be copied
  // reference: https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-files
  const publicSrc = path.join(__dirname, '../public');
  const publicDest = path.join(destDir, 'public');
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log('> Successfully copied public folder to standalone/public');
  }

  const staticSrc = path.join(__dirname, '../.next/static');
  const staticDest = path.join(destDir, '.next/static');
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
    console.log('> Successfully copied static assets to standalone/.next/static');
  }
} catch (err) {
  console.error('> Error during post-build execution:', err);
  process.exit(1);
}
