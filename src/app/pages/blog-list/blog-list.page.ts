import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { BlogArticleSummary } from '../../blog/blog.models';
import { BlogService } from '../../blog/blog.service';

@Component({
  selector: 'app-blog-list-page',
  imports: [RouterLink, AsyncPipe, DatePipe],
  templateUrl: './blog-list.page.html',
})
export class BlogListPageComponent {
  private readonly blogService = inject(BlogService);
  protected readonly articles$: Observable<BlogArticleSummary[]> = this.blogService.getArticles();
}
