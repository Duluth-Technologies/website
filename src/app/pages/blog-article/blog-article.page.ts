import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { BlogArticle } from '../../blog/blog.models';
import { BlogService } from '../../blog/blog.service';

@Component({
  selector: 'app-blog-article-page',
  imports: [AsyncPipe, DatePipe, RouterLink],
  templateUrl: './blog-article.page.html',
})
export class BlogArticlePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private mermaidPromise: Promise<(typeof import('mermaid'))['default']> | null = null;

  private getMermaid(): Promise<(typeof import('mermaid'))['default']> {
    if (!this.mermaidPromise) {
      this.mermaidPromise = import('mermaid').then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'default',
        });
        return mermaid;
      });
    }
    return this.mermaidPromise;
  }

  private renderMermaidDiagrams(): void {
    setTimeout(() => {
      const diagrams = document.querySelectorAll<HTMLElement>('.article-content .mermaid');
      if (diagrams.length > 0) {
        void this.getMermaid().then(async (mermaid) => {
          await mermaid.run({ nodes: diagrams });
          this.enableMermaidPreview(diagrams);
        });
      }
    });
  }

  private enableMermaidPreview(diagrams: NodeListOf<HTMLElement>): void {
    diagrams.forEach((diagram) => {
      if (diagram.dataset['previewEnabled'] === 'true') {
        return;
      }

      diagram.dataset['previewEnabled'] = 'true';
      diagram.classList.add('mermaid-clickable');
      diagram.style.cursor = 'pointer';

      const svg = diagram.querySelector('svg');
      if (svg) {
        svg.style.cursor = 'pointer';
        const svgChildren = svg.querySelectorAll<SVGElement>('*');
        svgChildren.forEach((node) => {
          node.style.cursor = 'pointer';
        });
      }

      diagram.title = 'Click to enlarge';
      diagram.addEventListener('click', () => {
        const currentSvg = diagram.querySelector('svg');
        if (!currentSvg) {
          return;
        }
        this.openMermaidPreview(currentSvg);
      });
    });
  }

  private openMermaidPreview(sourceSvg: SVGElement): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'mermaid-preview-backdrop';

    const panel = document.createElement('div');
    panel.className = 'mermaid-preview-panel';

    const closeButton = document.createElement('button');
    closeButton.className = 'mermaid-preview-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close diagram preview');
    closeButton.textContent = 'Close';

    const svgClone = sourceSvg.cloneNode(true);
    if (!(svgClone instanceof SVGElement)) {
      return;
    }
    svgClone.removeAttribute('style');

    const close = () => {
      document.removeEventListener('keydown', onKeyDown);
      backdrop.remove();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    backdrop.addEventListener('click', close);
    panel.addEventListener('click', (event) => event.stopPropagation());
    closeButton.addEventListener('click', close);
    document.addEventListener('keydown', onKeyDown);

    panel.appendChild(closeButton);
    panel.appendChild(svgClone);
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
  }

  protected readonly article$: Observable<BlogArticle | null> = this.route.paramMap.pipe(
    map((params) => params.get('slug') ?? ''),
    switchMap((slug) => this.blogService.getArticleBySlug(slug)),
    tap((article) => {
      if (!article) {
        this.title.setTitle('Article Not Found | Duluth Technologies Blog');
        this.meta.updateTag({ name: 'description', content: 'The requested article was not found.' });
        return;
      }

      this.title.setTitle(`${article.title} | Duluth Technologies Blog`);
      this.meta.updateTag({ name: 'description', content: article.summary });
      this.renderMermaidDiagrams();
    }),
  );
}
