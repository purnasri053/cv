const sharp = require('sharp');
const fs = require('fs');

fs.mkdirSync('public/icons', { recursive: true });

sharp('logo.png').resize(192, 192).png().toFile('public/icons/icon-192.png')
  .then(() => console.log('icon-192.png done'));

sharp('logo.png').resize(512, 512).png().toFile('public/icons/icon-512.png')
  .then(() => console.log('icon-512.png done'));

sharp('logo.png').resize(180, 180).png().toFile('public/icons/apple-touch-icon.png')
  .then(() => console.log('apple-touch-icon.png done'));
