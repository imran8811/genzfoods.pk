import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { PlacedOrder } from '../../models/catalog.model';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmation {
  private orders = inject(OrderService);

  order = signal<PlacedOrder | null>(this.orders.getLastOrder());

  get paymentLabel(): string {
    return this.order()?.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery';
  }
}
