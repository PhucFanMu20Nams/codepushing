// image-optimizer.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing images
const imageDir = path.join(__dirname, 'public', 'assets', 'images');
const outputDir = path.join(__dirname, 'public', 'assets', 'optimized-images');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Process images
async function optimizeImages() {
  try {
    const files = fs.readdirSync(imageDir);
    
    for (const file of files) {
      const inputPath = path.join(imageDir, file);
      // Skip directories and non-image files
      if (fs.lstatSync(inputPath).isDirectory() || 
          !file.match(/\.(jpg|jpeg|png|gif)$/i)) {
        continue;
      }

      const outputPath = path.join(outputDir, file.replace(/\.[^.]+$/, '.webp'));
      
      console.log(`Optimizing: ${file}`);
      
      await sharp(inputPath)
        .webp({ quality: 80 }) // Convert to WebP with 80% quality
        .toFile(outputPath);
        
      console.log(`Created: ${path.basename(outputPath)}`);
    }
    
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages();
