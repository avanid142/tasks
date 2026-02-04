const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'images', 'bg.svg');
const jpgPath = path.join(__dirname, '..', 'public', 'images', 'bg.jpg');
const webpPath = path.join(__dirname, '..', 'public', 'images', 'bg.webp');

(async () => {
  try {
    if (!fs.existsSync(svgPath)) {
      console.error('SVG not found at', svgPath);
      process.exit(1);
    }

    const svgBuffer = fs.readFileSync(svgPath);

    // Produce a reasonably sized JPEG and WebP (width 1600, quality 80)
    await sharp(svgBuffer)
      .resize({ width: 1600 })
      .jpeg({ quality: 80 })
      .toFile(jpgPath);

    await sharp(svgBuffer)
      .resize({ width: 1600 })
      .webp({ quality: 80 })
      .toFile(webpPath);

    console.log('Generated:', jpgPath);
    console.log('Generated:', webpPath);
  } catch (err) {
    console.error('Image generation failed:', err);
    process.exit(2);
  }
})();