import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { ShippingDetails } from '../../models/menu-item.model';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  items = this.cartService.items;
  subtotal = this.cartService.subtotal;
  deliveryFee = this.cartService.deliveryFee;
  total = this.cartService.total;
  itemCount = this.cartService.itemCount;

  fullName = '';
  phone = '';
  email = '';
  address = '';
  city = '';
  notes = '';

  errorMessage = signal('');
  loading = signal(false);

  formatPrice(price: number): string {
    return 'Rs. ' + price.toLocaleString();
  }

  onSubmit() {
    this.errorMessage.set('');

    if (this.items().length === 0) {
      this.errorMessage.set('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!this.fullName || !this.phone || !this.email || !this.address || !this.city) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(this.phone)) {
      this.errorMessage.set('Please enter a valid phone number.');
      return;
    }

    this.loading.set(true);

    // Simulate processing delay
    setTimeout(() => {
      const shipping: ShippingDetails = {
        fullName: this.fullName,
        phone: this.phone,
        email: this.email,
        address: this.address,
        city: this.city,
        notes: this.notes,
      };

      this.orderService.placeOrder(shipping);
      this.loading.set(false);
      this.router.navigate(['/order-confirmation']);
    }, 1200);
  }
}
