export interface BlogArticleSummary {
  slug: string;
  title: string;
  date: string;
  summary: string;
  readingMinutes: number;
  markdownPath: string;
  sourcePath: string;
}

export interface BlogArticleIndex {
  articles: BlogArticleSummary[];
}

export interface BlogArticle extends BlogArticleSummary {
  markdown: string;
  html: string;
}
