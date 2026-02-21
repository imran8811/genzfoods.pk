import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from '../../models/menu-item.model';
import { CartService } from '../../services/cart.service';
import { FoodCatalogService } from '../../services/food-catalog.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit {
  private cartService = inject(CartService);
  private foodCatalogService = inject(FoodCatalogService);

  menuItems = signal<MenuItem[]>([]);
  activeCategory = signal('All');
  addedItem = signal<number | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  categories = computed(() => {
    const unique = new Set(this.menuItems().map(item => item.category));
    return ['All', ...Array.from(unique)];
  });

  filteredItems = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'All') {
      return this.menuItems();
    }

    return this.menuItems().filter(item => item.category === cat);
  });

  cartItemCount = this.cartService.itemCount;

  ngOnInit(): void {
    this.foodCatalogService.getFoodItems().subscribe({
      next: items => {
        this.menuItems.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load menu from API. Please try again.');
        this.loading.set(false);
      },
    });

    this.cartService.fetchCart().subscribe();
  }

  setCategory(category: string): void {
    this.activeCategory.set(category);
  }

  addToCart(item: MenuItem): void {
    this.errorMessage.set('');
    this.cartService.addItem(item).subscribe(result => {
      if (result.success) {
        this.addedItem.set(item.id);
        setTimeout(() => this.addedItem.set(null), 1200);
        return;
      }

      this.errorMessage.set(result.message);
    });
  }

  getQuantity(foodItemId: number): number {
    return this.cartService.getItemQuantity(foodItemId);
  }
}
