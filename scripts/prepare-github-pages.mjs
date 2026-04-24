import { copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const browserOutputDir = path.join(root, 'dist', 'angular-app', 'browser');
const indexPath = path.join(browserOutputDir, 'index.html');
const notFoundPath = path.join(browserOutputDir, '404.html');

await stat(indexPath);
await copyFile(indexPath, notFoundPath);

console.log('Prepared GitHub Pages SPA fallback at dist/angular-app/browser/404.html');
