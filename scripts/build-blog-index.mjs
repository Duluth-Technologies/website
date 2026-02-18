import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'content', 'articles');
const outputRoot = path.join(root, 'public', 'blog');
const outputContentDir = path.join(outputRoot, 'content');
const outputIndexFile = path.join(outputRoot, 'articles.json');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseFrontMatter(raw) {
  if (!raw.startsWith('---\n')) {
    return { meta: {}, body: raw };
  }

  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) {
    return { meta: {}, body: raw };
  }

  const head = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const meta = {};

  for (const line of head.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    if (key) {
      meta[key] = value;
    }
  }

  return { meta, body };
}

function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadingMinutes(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

async function readMarkdownFiles(dir, bucket = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await readMarkdownFiles(fullPath, bucket);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      bucket.push(fullPath);
    }
  }
  return bucket;
}

async function build() {
  await ensureDir(outputRoot);

  if (!(await exists(sourceDir))) {
    await fs.writeFile(outputIndexFile, JSON.stringify({ articles: [] }, null, 2));
    console.log('No content/articles directory found. Wrote empty blog index.');
    return;
  }

  await fs.rm(outputContentDir, { recursive: true, force: true });
  await fs.cp(sourceDir, outputContentDir, { recursive: true });

  const markdownFiles = await readMarkdownFiles(sourceDir);
  const articles = [];

  for (const filePath of markdownFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    const rel = path.relative(sourceDir, filePath);
    const relUrl = rel.split(path.sep).join('/');
    const { meta, body } = parseFrontMatter(raw);
    const lines = body.split('\n');
    const firstHeading = lines.find((line) => line.startsWith('# '));

    const fallbackTitle =
      (firstHeading && firstHeading.replace(/^#\s+/, '').trim()) ||
      path.basename(filePath, '.md').replace(/[-_]+/g, ' ');

    const title = meta.title || fallbackTitle;
    const date = meta.date || new Date((await fs.stat(filePath)).mtime).toISOString().slice(0, 10);
    const summary = meta.summary || stripMarkdown(body).slice(0, 180).trim();
    const slug = meta.slug || slugify(path.basename(filePath, '.md'));
    const cleanText = stripMarkdown(body);

    articles.push({
      slug,
      title,
      date,
      summary,
      readingMinutes: estimateReadingMinutes(cleanText),
      markdownPath: `/blog/content/${relUrl}`,
      sourcePath: relUrl,
    });
  }

  articles.sort((a, b) => b.date.localeCompare(a.date));
  await fs.writeFile(outputIndexFile, JSON.stringify({ articles }, null, 2));
  console.log(`Generated blog index with ${articles.length} article(s).`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
