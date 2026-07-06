import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { Category, Deal, DealOption, MenuItem, SiteInfo, Variant } from '../models/catalog.model';

// ===== Admin public feed (menu.json shape) =====
interface FeedItem {
  id: string;
  name: string;
  description?: string | null;
  price?: number | string;
  prices?: Record<string, number | string | null>;
  special?: boolean;
  signature?: boolean;
  tag?: string;
  pizzaSelection?: { size: string; count: number; from: string[] };
  dealExtras?: string[];
  image?: string;
}
interface FeedCategory {
  id: string;
  name: string;
  type: 'single' | 'sized';
  sizes?: string[];
  image?: string;
  items: FeedItem[];
}
interface Feed {
  generated_at?: string;
  categories: FeedCategory[];
}

interface ParsedMenu {
  categories: Category[];
  deals: Deal[];
}

const MENU_CACHE_KEY = 'genz_menu_cache_v1';

const isDeals = (slug: string) => slug.endsWith('deals');
const num = (v: unknown): number => (typeof v === 'string' ? parseFloat(v) : (v as number)) || 0;

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  /** Fallback imagery per category slug when an item has no photo. */
  private readonly categoryImages: Record<string, string> = {
    pizza: 'images/menu/pizza.jpg',
    burgers: 'images/menu/burgers.png',
    'cold-drinks': 'images/menu/cold-drinks.png',
    starters: 'images/menu/starters.png',
  };

  private parsed: ParsedMenu | null = null;

  getSite(): Observable<SiteInfo> {
    return this.api.get<SiteInfo>('/site');
  }

  /** Categories from the genz-admin feed (cached in localStorage for instant loads). */
  getMenu(): Observable<Category[]> {
    return this.loadFeed().pipe(map((m) => m.categories));
  }

  /** Deals derived from the *-deals categories of the same feed. */
  getDeals(): Observable<Deal[]> {
    return this.loadFeed().pipe(map((m) => m.deals));
  }

  private loadFeed(): Observable<ParsedMenu> {
    if (this.parsed) return of(this.parsed);

    const cached = this.readCache();
    if (cached) this.parsed = cached;

    const fetched = fetch(environment.adminMenuUrl, { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`Menu feed HTTP ${res.status}`);
        return res.json() as Promise<Feed>;
      })
      .then((feed) => {
        const parsed = this.parseFeed(feed);
        this.parsed = parsed;
        this.writeCache(parsed);
        return parsed;
      })
      .catch((err) => {
        if (this.parsed) return this.parsed; // fall back to cache
        throw err;
      });

    // If we have a cache, emit it immediately; otherwise wait for the network.
    return cached ? of(cached) : from(fetched);
  }

  private parseFeed(feed: Feed): ParsedMenu {
    const cats = feed.categories ?? [];

    // slug -> name for every non-deal item, to label deal options.
    const nameBySlug: Record<string, string> = {};
    for (const c of cats) {
      if (isDeals(c.id)) continue;
      for (const it of c.items ?? []) nameBySlug[it.id] = it.name;
    }

    const categories: Category[] = [];
    const deals: Deal[] = [];

    for (const c of cats) {
      if (isDeals(c.id)) {
        for (const it of c.items ?? []) {
          const sel = it.pizzaSelection;
          deals.push({
            name: it.name,
            slug: it.id,
            group: c.name,
            description: it.description ?? null,
            price: num(it.price),
            tag: it.tag ?? null,
            image_url: it.image ?? null,
            requires_selection: !!sel && (sel.from?.length ?? 0) > 0,
            selection_size: sel?.size ?? null,
            selection_count: sel?.count ?? 0,
            extras: it.dealExtras ?? [],
            options: (sel?.from ?? []).map(
              (slug): DealOption => ({ slug, name: nameBySlug[slug] ?? slug }),
            ),
          });
        }
        continue;
      }

      const items: MenuItem[] = (c.items ?? []).map((it) => {
        const variants: Variant[] = [];
        if (it.prices && typeof it.prices === 'object') {
          const order = c.sizes?.length ? c.sizes : Object.keys(it.prices);
          for (const label of order) {
            if (it.prices[label] == null) continue;
            variants.push({ label, price: num(it.prices[label]) });
          }
        } else {
          variants.push({ label: null, price: num(it.price) });
        }
        const prices = variants.map((v) => v.price);
        return {
          name: it.name,
          slug: it.id,
          description: it.description ?? null,
          image_url: it.image ?? null,
          is_special: !!it.special,
          is_signature: !!it.signature,
          is_available: true,
          category_slug: c.id,
          price_from: prices.length ? Math.min(...prices) : null,
          variants,
        };
      });

      categories.push({
        name: c.name,
        slug: c.id,
        type: c.type,
        sizes: c.sizes ?? null,
        image_url: c.image ?? null,
        items,
      });
    }

    return { categories, deals };
  }

  private readCache(): ParsedMenu | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(MENU_CACHE_KEY);
      return raw ? (JSON.parse(raw) as ParsedMenu) : null;
    } catch {
      return null;
    }
  }

  private writeCache(menu: ParsedMenu): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menu));
    } catch {
      /* ignore quota/private-mode errors */
    }
  }

  /** Resolve a display image for an item, falling back to category art. */
  imageFor(item: Pick<MenuItem, 'image_url' | 'category_slug'>, categorySlug?: string): string {
    if (item.image_url) return item.image_url;
    const slug = item.category_slug ?? categorySlug ?? '';
    return this.categoryImages[slug] ?? 'images/menu/loaded.png';
  }
}
