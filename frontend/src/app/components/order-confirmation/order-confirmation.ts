import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmation {
  private orderService = inject(OrderService);

  order = this.orderService.latestOrder;

  formatPrice(price: number): string {
    return 'Rs. ' + price.toLocaleString();
  }
}
