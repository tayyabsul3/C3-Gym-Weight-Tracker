const fs = require('fs');
const path = require('path');

const svgContent = fs.readFileSync('./public/favicon.svg', 'utf8');
const iconsDir = './public/icons';

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  const icon = svgContent.replace('width="100%" height="100%"', 'width="' + size + '" height="' + size + '"');
  fs.writeFileSync(path.join(iconsDir, 'icon-' + size + '.png'), icon); // browsers accept SVG even with .png ext for manifest
  fs.writeFileSync(path.join(iconsDir, 'icon-' + size + '.svg'), icon);
});

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), svgContent.replace('width="100%" height="100%"', 'width="180" height="180"'));
fs.writeFileSync(path.join(iconsDir, 'maskable-512.png'), svgContent.replace('width="100%" height="100%"', 'width="512" height="512"'));
fs.writeFileSync(path.join(iconsDir, 'icon-72.png'), svgContent.replace('width="100%" height="100%"', 'width="72" height="72"'));

console.log('Icons created successfully');
