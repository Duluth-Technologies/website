import { AsyncPipe, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { BlogArticleSummary } from '../../blog/blog.models';
import { BlogService } from '../../blog/blog.service';

type Customer = {
  name: string;
  logoUrl: string;
  websiteUrl: string;
};

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, AsyncPipe, DatePipe],
  templateUrl: './home.page.html',
})
export class HomePageComponent implements AfterViewInit {
  @ViewChild('customerGrid') private customerGrid?: ElementRef<HTMLDivElement>;

  private readonly blogService = inject(BlogService);
  protected readonly latestArticles$: Observable<BlogArticleSummary[]> =
    this.blogService.getLatestArticles(3);
  protected readonly customers: Customer[] = [
    {
      name: 'Amadeus',
      logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amadeus%20Organization%20logo%202024.svg',
      websiteUrl: 'https://amadeus.com',
    },
    {
      name: 'Thales Alenia Space',
      logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Thales%20Alenia%20Space%20Logo.svg',
      websiteUrl: 'https://www.thalesaleniaspace.com/en',
    },
    {
      name: 'SII',
      logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo%20SII.svg',
      websiteUrl: 'https://sii-group.com',
    },
    {
      name: 'Dream Energy',
      logoUrl: 'https://www.dream-energy.fr/wp-content/themes/t-dreamenergy/assets/images/homepage/logo-dream-energy.svg',
      websiteUrl: 'https://www.dream-energy.fr/',
    },
    {
      name: 'Toulouse Business School',
      logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Toulouse%20Business%20School%20Logo.svg',
      websiteUrl: 'https://www.tbs-education.fr/',
    },
    {
      name: "College Saint François d'Assise",
      logoUrl: 'https://www.collegesaintfrancoisnice.fr/wp-content/uploads/2024/10/Calque_1.png',
      websiteUrl: 'https://www.collegesaintfrancoisnice.fr/',
    },
  ];
  protected hasCustomerOverflow = false;

  ngAfterViewInit(): void {
    queueMicrotask(() => this.updateCustomerOverflow());
  }

  protected scrollCustomers(direction: 'left' | 'right'): void {
    const element = this.customerGrid?.nativeElement;
    if (!element) {
      return;
    }

    const scrollAmount = Math.round(element.clientWidth * 0.8);
    const delta = direction === 'right' ? scrollAmount : -scrollAmount;
    element.scrollBy({ left: delta, behavior: 'smooth' });
  }

  protected updateCustomerOverflow(): void {
    const element = this.customerGrid?.nativeElement;
    if (!element) {
      this.hasCustomerOverflow = false;
      return;
    }

    this.hasCustomerOverflow = element.scrollWidth > element.clientWidth + 1;
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    this.updateCustomerOverflow();
  }
}
