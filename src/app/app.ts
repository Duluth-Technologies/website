import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.router.routerState.root.firstChild;
        const pageTitle = route?.snapshot.data['title'] as string | undefined;
        const pageDescription = route?.snapshot.data['description'] as string | undefined;

        if (pageTitle) {
          this.title.setTitle(pageTitle);
        }

        if (pageDescription) {
          this.meta.updateTag({ name: 'description', content: pageDescription });
        }
      });
  }
}
