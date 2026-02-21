import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { CartItem, Order, ShippingDetails } from '../models/menu-item.model';
import { ApiService } from './api.service';
import { CartService } from './cart.service';

interface ShippingAddressResponse {
  address: {
    id: number;
  };
}

interface CheckoutResponse {
  message: string;
  order: {
    id: number;
    order_number: string;
    status: string;
    subtotal: string | number;
    delivery_fee: string | number;
    tax_amount: string | number;
    total_amount: string | number;
    shipping_name: string;
    shipping_phone: string;
    shipping_address_line_1: string;
    shipping_city: string;
    notes: string | null;
    placed_at: string;
    items: Array<{
      id: number;
      food_name: string;
      quantity: number;
      unit_price: string | number;
      line_total: string | number;
    }>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private api = inject(ApiService);
  private cartService = inject(CartService);

  private lastOrder = signal<Order | null>(null);

  latestOrder = computed(() => this.lastOrder());

  placeOrder(shipping: ShippingDetails): Observable<{ success: boolean; message: string }> {
    return this.api
      .post<ShippingAddressResponse>(
        '/shipping-addresses',
        {
          label: 'Primary',
          recipient_name: shipping.fullName,
          phone: shipping.phone,
          address_line_1: shipping.address,
          city: shipping.city,
          postal_code: '00000',
          country: 'Pakistan',
          is_default: true,
        },
        true
      )
      .pipe(
        switchMap(addressResponse =>
          this.api.post<CheckoutResponse>(
            '/checkout',
            {
              shipping_address_id: addressResponse.address.id,
              payment_method: 'cod',
              notes: shipping.notes || null,
            },
            true
          )
        ),
        tap(response => {
          const order = this.mapApiOrder(response.order, shipping);
          this.lastOrder.set(order);
          this.cartService.fetchCart().subscribe();
        }),
        map(response => ({
          success: true,
          message: response.message || 'Order placed successfully.',
        })),
        catchError(error =>
          of({
            success: false,
            message: this.api.getErrorMessage(error, 'Unable to place your order.'),
          })
        )
      );
  }

  private mapApiOrder(apiOrder: CheckoutResponse['order'], shipping: ShippingDetails): Order {
    const items: CartItem[] = apiOrder.items.map(item => {
      const unitPrice = Number(item.unit_price);

      return {
        id: item.id,
        quantity: item.quantity,
        item: {
          id: item.id,
          name: item.food_name,
          description: 'Prepared fresh for your order.',
          price: unitPrice,
          displayPrice: `Rs. ${unitPrice.toLocaleString()}`,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
          category: 'Menu',
        },
      };
    });

    return {
      id: apiOrder.id,
      orderNumber: apiOrder.order_number,
      items,
      shipping,
      subtotal: Number(apiOrder.subtotal),
      deliveryFee: Number(apiOrder.delivery_fee),
      taxAmount: Number(apiOrder.tax_amount),
      total: Number(apiOrder.total_amount),
      status: apiOrder.status,
      createdAt: new Date(apiOrder.placed_at),
    };
  }
}
