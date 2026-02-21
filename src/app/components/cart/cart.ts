import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  cartService = inject(CartService);

  items = this.cartService.items;
  subtotal = this.cartService.subtotal;
  deliveryFee = this.cartService.deliveryFee;
  total = this.cartService.total;
  taxAmount = this.cartService.taxAmount;
  itemCount = this.cartService.itemCount;

  ngOnInit(): void {
    this.cartService.fetchCart().subscribe();
  }

  increment(cartItemId: number, quantity: number): void {
    this.cartService.updateQuantity(cartItemId, quantity + 1).subscribe();
  }

  decrement(cartItemId: number, quantity: number): void {
    this.cartService.updateQuantity(cartItemId, quantity - 1).subscribe();
  }

  remove(cartItemId: number): void {
    this.cartService.removeItem(cartItemId).subscribe();
  }

  formatPrice(price: number): string {
    return 'Rs. ' + price.toLocaleString();
  }
}
