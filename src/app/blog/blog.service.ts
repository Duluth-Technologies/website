import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { BlogArticle, BlogArticleIndex, BlogArticleSummary } from './blog.models';
import { markdownToHtml } from './markdown';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);

  private readonly articles$ = this.http
    .get<BlogArticleIndex>('/blog/articles.json')
    .pipe(
      map((response) => response.articles || []),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

  private resolveUrl(url: string, basePath: string): string {
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('/') ||
      url.startsWith('#') ||
      url.startsWith('mailto:')
    ) {
      return url;
    }

    return `${basePath}${url.replace(/^\.\//, '')}`;
  }

  private normalizeMarkdownAssetLinks(markdown: string, markdownPath: string): string {
    const basePath = markdownPath.slice(0, markdownPath.lastIndexOf('/') + 1);
    return markdown.replace(/(!?\[[^\]]*\]\()([^)]+)(\))/g, (_, start: string, url: string, end: string) => {
      return `${start}${this.resolveUrl(url, basePath)}${end}`;
    });
  }

  private stripFrontMatter(markdown: string): string {
    if (!markdown.startsWith('---\n')) {
      return markdown;
    }

    const end = markdown.indexOf('\n---\n', 4);
    if (end === -1) {
      return markdown;
    }

    return markdown.slice(end + 5);
  }

  private stripLeadingTitleHeading(markdown: string, title: string): string {
    const match = markdown.match(/^\s*#\s+(.+?)\s*(?:\r?\n)+/);
    if (!match) {
      return markdown;
    }

    const headingText = match[1].replace(/\s+#+\s*$/, '').trim();
    if (headingText.toLowerCase() !== title.trim().toLowerCase()) {
      return markdown;
    }

    return markdown.slice(match[0].length);
  }

  getArticles(): Observable<BlogArticleSummary[]> {
    return this.articles$;
  }

  getLatestArticles(limit = 3): Observable<BlogArticleSummary[]> {
    return this.articles$.pipe(map((articles) => articles.slice(0, limit)));
  }

  getArticleBySlug(slug: string): Observable<BlogArticle | null> {
    return this.articles$.pipe(
      map((articles) => articles.find((article) => article.slug === slug) || null),
      switchMap((summary) => {
        if (!summary) {
          return of(null);
        }

        return this.http.get(summary.markdownPath, { responseType: 'text' }).pipe(
          map((markdown) => {
            const cleanedMarkdown = this.stripFrontMatter(markdown);
            const markdownWithoutDuplicateTitle = this.stripLeadingTitleHeading(
              cleanedMarkdown,
              summary.title,
            );
            const normalizedMarkdown = this.normalizeMarkdownAssetLinks(
              markdownWithoutDuplicateTitle,
              summary.markdownPath,
            );
            return {
              ...summary,
              markdown: normalizedMarkdown,
              html: markdownToHtml(normalizedMarkdown),
            };
          }),
        );
      }),
    );
  }
}
