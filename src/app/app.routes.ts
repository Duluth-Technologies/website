import { Routes } from '@angular/router';
import { AboutPageComponent } from './pages/about/about.page';
import { BlogArticlePageComponent } from './pages/blog-article/blog-article.page';
import { BlogListPageComponent } from './pages/blog-list/blog-list.page';
import { ContactPageComponent } from './pages/contact/contact.page';
import { HomePageComponent } from './pages/home/home.page';
import { LegalNoticePageComponent } from './pages/legal-notice/legal-notice.page';
import { PrivacyPageComponent } from './pages/privacy/privacy.page';
import { ServicesPageComponent } from './pages/services/services.page';
import { TermsPageComponent } from './pages/terms/terms.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    data: {
      title: 'Duluth Technologies | Senior Software Team for Delivery and Product Ownership',
      description:
        'We build and run software products end-to-end for SMEs and scale-ups. Client services plus in-house products, led by a senior team.',
    },
  },
  {
    path: 'services',
    component: ServicesPageComponent,
    data: {
      title: 'Software Delivery Services | End-to-End Product Ownership',
      description:
        'From discovery to delivery, modernization, and ongoing operations. We take full technical ownership and deliver reliable software outcomes.',
    },
  },
  {
    path: 'about',
    component: AboutPageComponent,
    data: {
      title: 'About Duluth Technologies | Senior Team, Product Mindset, Reliable Delivery',
      description:
        'Learn how our team combines technical leadership, product thinking, and operational discipline to build software that lasts.',
    },
  },
  {
    path: 'blog',
    component: BlogListPageComponent,
    data: {
      title: 'Software Delivery Blog | Practical Lessons from Real Projects',
      description:
        'Articles on product decisions, reliability, delivery trade-offs, and production lessons from real-world software work.',
    },
  },
  {
    path: 'blog/:slug',
    component: BlogArticlePageComponent,
  },
  {
    path: 'insights',
    redirectTo: 'blog',
    pathMatch: 'full',
  },
  {
    path: 'contact',
    component: ContactPageComponent,
    data: {
      title: 'Contact Duluth Technologies | Start Your Software Project Conversation',
      description:
        'Share your goals, timeline, and constraints. We will respond with a clear next step for discovery and planning.',
    },
  },
  {
    path: 'mentions-legales',
    component: LegalNoticePageComponent,
    data: {
      title: 'Mentions Legales | Duluth Technologies',
      description:
        'Informations legales sur l editeur, l hebergement et l utilisation du site Duluth Technologies.',
    },
  },
  {
    path: 'privacy',
    component: PrivacyPageComponent,
    data: {
      title: 'Privacy Policy | Duluth Technologies',
      description:
        'Read how Duluth Technologies collects, uses, and protects personal information submitted through this website.',
    },
  },
  {
    path: 'terms',
    component: TermsPageComponent,
    data: {
      title: 'Terms of Use | Duluth Technologies',
      description:
        'Read the terms governing use of the Duluth Technologies website and related content.',
    },
  },
  { path: '**', redirectTo: '' },
];
