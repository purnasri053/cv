const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create icons directory
fs.mkdirSync(path.join(__dirname, 'public/icons'), { recursive: true });

// Generate a simple purple square with "CV" text as PNG using raw pixel data
// We'll create a gradient purple background icon
const size192 = 192;
const size512 = 512;

// Create SVG buffer and convert to PNG
const makeSVG = (size) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size*0.18}" fill="url(#g)"/>
  <text x="${size/2}" y="${size*0.52}" font-family="Arial,sans-serif" font-size="${size*0.38}" 
        font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle">CV</text>
  <rect x="${size*0.15}" y="${size*0.68}" width="${size*0.7}" height="${size*0.05}" rx="${size*0.025}" fill="rgba(255,255,255,0.5)"/>
</svg>`);

async function generate() {
  await sharp(makeSVG(size192)).png().toFile('public/icons/icon-192.png');
  console.log('Generated icon-192.png');
  await sharp(makeSVG(size512)).png().toFile('public/icons/icon-512.png');
  console.log('Generated icon-512.png');
}

generate().catch(console.error);
