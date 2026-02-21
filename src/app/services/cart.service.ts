import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { CartItem, MenuItem } from '../models/menu-item.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

interface ApiFoodItem {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  category?: string;
}

interface ApiCartItem {
  id: number;
  food_item_id: number;
  quantity: number;
  food_item: ApiFoodItem;
}

interface ApiCartResponse {
  cart: {
    items: ApiCartItem[];
    summary: {
      items_count: number;
      subtotal: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  private cartItems = signal<CartItem[]>([]);
  private isLoading = signal(false);

  items = computed(() => this.cartItems());
  loading = computed(() => this.isLoading());
  itemCount = computed(() => this.cartItems().reduce((sum, ci) => sum + ci.quantity, 0));
  subtotal = computed(() => this.cartItems().reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0));
  deliveryFee = computed(() => {
    const currentSubtotal = this.subtotal();
    if (currentSubtotal <= 0) {
      return 0;
    }
    return currentSubtotal >= 500 ? 0 : 40;
  });
  taxAmount = computed(() => Math.round(this.subtotal() * 0.05));
  total = computed(() => this.subtotal() + this.deliveryFee() + this.taxAmount());

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.fetchCart().subscribe();
      } else {
        this.cartItems.set([]);
      }
    });
  }

  fetchCart(): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      this.cartItems.set([]);
      return of(false);
    }

    this.isLoading.set(true);
    return this.api.get<ApiCartResponse>('/cart', true).pipe(
      tap(response => {
        this.cartItems.set(this.mapApiCartItems(response.cart.items));
        this.isLoading.set(false);
      }),
      map(() => true),
      catchError(() => {
        this.isLoading.set(false);
        return of(false);
      })
    );
  }

  addItem(item: MenuItem): Observable<{ success: boolean; message: string }> {
    if (!this.authService.isAuthenticated()) {
      return of({ success: false, message: 'Please login to add items to cart.' });
    }

    return this.api
      .post<ApiCartResponse & { message: string }>(
        '/cart/items',
        { food_item_id: item.id, quantity: 1 },
        true
      )
      .pipe(
        tap(response => this.cartItems.set(this.mapApiCartItems(response.cart.items))),
        map(response => ({ success: true, message: response.message || 'Item added to cart.' })),
        catchError(error =>
          of({
            success: false,
            message: this.api.getErrorMessage(error, 'Unable to add item to cart.'),
          })
        )
      );
  }

  removeItem(cartItemId: number): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      return of(false);
    }

    return this.api.delete<ApiCartResponse>(`/cart/items/${cartItemId}`, true).pipe(
      tap(response => this.cartItems.set(this.mapApiCartItems(response.cart.items))),
      map(() => true),
      catchError(() => of(false))
    );
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      return of(false);
    }

    if (quantity <= 0) {
      return this.removeItem(cartItemId);
    }

    return this.api.patch<ApiCartResponse>(`/cart/items/${cartItemId}`, { quantity }, true).pipe(
      tap(response => this.cartItems.set(this.mapApiCartItems(response.cart.items))),
      map(() => true),
      catchError(() => of(false))
    );
  }

  clearCart(): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      this.cartItems.set([]);
      return of(true);
    }

    return this.api.delete<ApiCartResponse>('/cart/clear', true).pipe(
      tap(response => this.cartItems.set(this.mapApiCartItems(response.cart.items))),
      map(() => true),
      catchError(() => of(false))
    );
  }

  getItemQuantity(foodItemId: number): number {
    return this.cartItems().find(ci => ci.item.id === foodItemId)?.quantity ?? 0;
  }

  private mapApiCartItems(items: ApiCartItem[]): CartItem[] {
    return items.map(ci => {
      const price = Number(ci.food_item.price);
      const menuItem: MenuItem = {
        id: ci.food_item.id,
        name: ci.food_item.name,
        description: ci.food_item.description ?? 'Freshly prepared and served hot.',
        price,
        displayPrice: `Rs. ${price.toLocaleString()}`,
        image:
          ci.food_item.image_url ||
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        category: ci.food_item.category ?? 'Menu',
      };

      return {
        id: ci.id,
        item: menuItem,
        quantity: ci.quantity,
      };
    });
  }
}
