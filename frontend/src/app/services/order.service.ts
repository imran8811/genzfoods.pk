import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Order, ShippingDetails, CartItem } from '../models/menu-item.model';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private platformId = inject(PLATFORM_ID);
  private cartService = inject(CartService);
  private isBrowser = isPlatformBrowser(this.platformId);

  private orders = signal<Order[]>([]);
  private lastOrder = signal<Order | null>(null);

  allOrders = computed(() => this.orders());
  latestOrder = computed(() => this.lastOrder());

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    if (!this.isBrowser) return;
    const stored = localStorage.getItem('genz_orders');
    if (stored) {
      try {
        this.orders.set(JSON.parse(stored));
      } catch {
        localStorage.removeItem('genz_orders');
      }
    }
  }

  private saveOrders(): void {
    if (!this.isBrowser) return;
    localStorage.setItem('genz_orders', JSON.stringify(this.orders()));
  }

  placeOrder(shipping: ShippingDetails): Order {
    const order: Order = {
      id: this.generateOrderId(),
      items: [...this.cartService.items()],
      shipping,
      subtotal: this.cartService.subtotal(),
      deliveryFee: this.cartService.deliveryFee(),
      total: this.cartService.total(),
      status: 'confirmed',
      createdAt: new Date(),
    };

    this.orders.update(list => [order, ...list]);
    this.lastOrder.set(order);
    this.saveOrders();
    this.cartService.clearCart();

    return order;
  }

  private generateOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'GZ-';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
}
