import { marked, Renderer, Tokens } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-yaml';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeFenceLanguage(language?: string): string | null {
  if (!language) {
    return null;
  }

  const normalized = language.toLowerCase();
  if (normalized === 'xml' || normalized === 'html' || normalized === 'svg') {
    return 'markup';
  }
  if (normalized === 'shell' || normalized === 'sh' || normalized === 'zsh') {
    return 'bash';
  }

  return normalized;
}

const renderer = new Renderer();
renderer.code = ({ text, lang }: Tokens.Code): string => {
  const language = normalizeFenceLanguage(lang);
  if (!language) {
    return `<pre><code>${escapeHtml(text)}</code></pre>\n`;
  }

  if (language === 'mermaid') {
    return `<div class="mermaid">${escapeHtml(text)}</div>\n`;
  }

  const grammar = Prism.languages[language];
  if (!grammar) {
    return `<pre><code class="language-${language}">${escapeHtml(text)}</code></pre>\n`;
  }

  const highlighted = Prism.highlight(text, grammar, language);
  return `<pre><code class="language-${language}">${highlighted}</code></pre>\n`;
};

export function markdownToHtml(markdown: string): string {
  return marked(markdown, {
    async: false,
    breaks: false,
    gfm: true,
    renderer,
  });
}
