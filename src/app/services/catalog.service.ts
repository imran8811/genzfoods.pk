import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Category, Deal, MenuItem, SiteInfo } from '../models/catalog.model';

interface Wrapped<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private api = inject(ApiService);

  /** Fallback imagery per category slug when an item has no photo. */
  private readonly categoryImages: Record<string, string> = {
    pizza: 'images/menu/pizza.jpg',
    burgers: 'images/menu/burgers.png',
    'cold-drinks': 'images/menu/cold-drinks.png',
    starters: 'images/menu/starters.png',
  };

  getSite(): Observable<SiteInfo> {
    return this.api.get<SiteInfo>('/site');
  }

  getMenu(): Observable<Category[]> {
    return this.api.get<Wrapped<Category[]>>('/menu').pipe(map(r => r.data));
  }

  getDeals(): Observable<Deal[]> {
    return this.api.get<Wrapped<Deal[]>>('/deals').pipe(map(r => r.data));
  }

  /** Resolve a display image for an item, falling back to category art. */
  imageFor(item: Pick<MenuItem, 'image_url' | 'category_slug'>, categorySlug?: string): string {
    if (item.image_url) return item.image_url;
    const slug = item.category_slug ?? categorySlug ?? '';
    return this.categoryImages[slug] ?? 'images/menu/loaded.png';
  }
}
