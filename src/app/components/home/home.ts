import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
import { Category, Deal, SiteInfo } from '../../models/catalog.model';

interface CatMeta { emoji: string; image?: string; blurb: string; }

@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private catalog = inject(CatalogService);

  site = signal<SiteInfo | null>(null);
  categories = signal<Category[]>([]);
  deals = signal<Deal[]>([]);

  featuredDeals = computed(() => this.deals().slice(0, 6));
  signature = computed(() =>
    this.categories()
      .flatMap(c => c.items)
      .find(i => i.is_signature),
  );

  private meta: Record<string, CatMeta> = {
    pizza: { emoji: '🍕', image: 'images/menu/pizza.jpg', blurb: 'Stone-baked, loaded with cheese' },
    burgers: { emoji: '🍔', image: 'images/menu/burgers.png', blurb: 'Juicy smash & crispy zingers' },
    wraps: { emoji: '🌯', image: '', blurb: 'Rolled fresh, packed with flavour' },
    sandwich: { emoji: '🥪', image: '', blurb: 'Gourmet stacks done right' },
    'cold-drinks': { emoji: '🥤', image: 'images/menu/cold-drinks.png', blurb: 'Ice-cold, every size' },
    'paratha-roll': { emoji: '🫓', image: '', blurb: 'Flaky paratha, spiced fillings' },
    starters: { emoji: '🍟', image: 'images/menu/starters.png', blurb: 'Fries, wings & crispy bites' },
    pasta: { emoji: '🍝', image: '', blurb: 'Creamy, cheesy, comforting' },
    dips: { emoji: '🥣', image: '', blurb: 'The perfect sidekick' },
  };

  constructor() {
    this.catalog.getSite().subscribe({ next: s => this.site.set(s), error: () => {} });
    this.catalog.getMenu().subscribe({ next: c => this.categories.set(c), error: () => {} });
    this.catalog.getDeals().subscribe({ next: d => this.deals.set(d), error: () => {} });
  }

  metaFor(slug: string): CatMeta {
    return this.meta[slug] ?? { emoji: '🍽️', image: '', blurb: 'Freshly made for you' };
  }
}
