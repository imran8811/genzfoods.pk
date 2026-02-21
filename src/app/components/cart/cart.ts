import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  cartService = inject(CartService);

  items = this.cartService.items;
  subtotal = this.cartService.subtotal;
  deliveryFee = this.cartService.deliveryFee;
  total = this.cartService.total;
  itemCount = this.cartService.itemCount;

  increment(itemName: string) {
    const qty = this.cartService.getItemQuantity(itemName);
    this.cartService.updateQuantity(itemName, qty + 1);
  }

  decrement(itemName: string) {
    const qty = this.cartService.getItemQuantity(itemName);
    this.cartService.updateQuantity(itemName, qty - 1);
  }

  remove(itemName: string) {
    this.cartService.removeItem(itemName);
  }

  formatPrice(price: number): string {
    return 'Rs. ' + price.toLocaleString();
  }
}
