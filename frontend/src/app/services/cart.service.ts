import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, MenuItem } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private cartItems = signal<CartItem[]>([]);

  items = computed(() => this.cartItems());
  itemCount = computed(() => this.cartItems().reduce((sum, ci) => sum + ci.quantity, 0));
  subtotal = computed(() =>
    this.cartItems().reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0)
  );
  deliveryFee = computed(() => (this.subtotal() > 0 ? 150 : 0));
  total = computed(() => this.subtotal() + this.deliveryFee());

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    if (!this.isBrowser) return;
    const stored = localStorage.getItem('genz_cart');
    if (stored) {
      try {
        this.cartItems.set(JSON.parse(stored));
      } catch {
        localStorage.removeItem('genz_cart');
      }
    }
  }

  private saveCart(): void {
    if (!this.isBrowser) return;
    localStorage.setItem('genz_cart', JSON.stringify(this.cartItems()));
  }

  addItem(item: MenuItem): void {
    this.cartItems.update(items => {
      const existing = items.find(ci => ci.item.name === item.name);
      if (existing) {
        return items.map(ci =>
          ci.item.name === item.name ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...items, { item, quantity: 1 }];
    });
    this.saveCart();
  }

  removeItem(itemName: string): void {
    this.cartItems.update(items => items.filter(ci => ci.item.name !== itemName));
    this.saveCart();
  }

  updateQuantity(itemName: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemName);
      return;
    }
    this.cartItems.update(items =>
      items.map(ci => (ci.item.name === itemName ? { ...ci, quantity } : ci))
    );
    this.saveCart();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCart();
  }

  getItemQuantity(itemName: string): number {
    return this.cartItems().find(ci => ci.item.name === itemName)?.quantity ?? 0;
  }
}
