import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = 'public';
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.mp4', '.webm', '.gif'];
const EXCLUDE_DIRS = ['icons']; // Usually small, manifest-related

async function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (EXCLUDE_DIRS.includes(dirent.name)) return [];
      return getFiles(res);
    } else {
      const ext = path.extname(res).toLowerCase();
      return ALLOWED_EXTENSIONS.includes(ext) ? res : [];
    }
  }));
  return Array.prototype.concat(...files);
}

const getContentType = (ext) => {
  const mapping = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.gif': 'image/gif'
  };
  return mapping[ext] || 'application/octet-stream';
};

async function sync() {
  console.log('🚀 Starting deep synchronization of all assets to Vercel Blob...');
  
  const allFiles = await getFiles(PUBLIC_DIR);
  console.log(`Found ${allFiles.length} files to process.`);

  const mapping = {};
  const currentDir = process.cwd();

  for (const filePath of allFiles) {
    try {
      const relativePath = path.relative(currentDir, filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      console.log(`Uploading ${relativePath}...`);
      const fileBuffer = fs.readFileSync(filePath);
      
      const blob = await put(relativePath, fileBuffer, {
        access: 'public',
        contentType: getContentType(ext),
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      console.log(`✅ Uploaded: ${blob.url}`);
      mapping[relativePath] = blob.url;
    } catch (error) {
      console.error(`❌ Error uploading ${filePath}:`, error.message);
    }
  }

  // Write mapping to a JSON file for easy access
  const mappingPath = path.resolve('lib/mediaAssets.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log('✨ lib/mediaAssets.json created/updated!');

  // Optional: Update mediaConfig.ts to be more robust
  const configPath = path.resolve('lib/mediaConfig.ts');
  const configContent = `/**
 * AUTO-GENERATED Media Configuration
 * Do not edit manually. Run sync-assets script to update.
 */
import assets from './mediaAssets.json';

export const MEDIA_ASSETS = {
  // Common Aliases
  THEME_MASTER_VIDEO: process.env.NEXT_PUBLIC_THEME_MASTER_VIDEO_URL || assets["public/videos/pass/theme_master.mp4"] || "/videos/pass/theme_master.mp4",
  HALER_SYMBOL: process.env.NEXT_PUBLIC_HALER_SYMBOL_URL || assets["public/images/halersymbol.png"] || "/images/halersymbol.png",
  BLIZ_DEVICE: process.env.NEXT_PUBLIC_BLIZ_DEVICE_URL || assets["public/images/bliz-device.png"] || "/images/bliz-device.png",
  
  FLAVORS: {
    mango: assets["public/flavors/mango.png"] || "/flavors/mango.png",
    melon: assets["public/flavors/melon.png"] || "/flavors/melon.png",
    berry: assets["public/flavors/berry.png"] || "/flavors/berry.png",
    peach: assets["public/flavors/peach.png"] || "/flavors/peach.png",
    lemon: assets["public/flavors/lemon.png"] || "/flavors/lemon.png",
  },

  // Raw Access
  all: assets
} as const;

export type MediaAssetKey = keyof typeof MEDIA_ASSETS;
`;

  fs.writeFileSync(configPath, configContent);
  console.log('✨ lib/mediaConfig.ts updated with full asset mapping!');
}

sync().catch(console.error);
