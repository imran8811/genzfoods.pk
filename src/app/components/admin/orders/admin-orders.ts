import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { AdminOrder, ORDER_STATUSES } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-orders',
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="toolbar">
      <h2>Orders</h2>
      <select class="input" style="width:auto" [(ngModel)]="filterStatus" (ngModelChange)="load()">
        <option value="">All statuses</option>
        @for (s of statuses; track s) { <option [value]="s">{{ s.replace('_', ' ') }}</option> }
      </select>
    </div>

    <div class="panel table-wrap">
      <table class="a-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Pay</th><th class="num">Total</th><th>Status</th><th></th></tr></thead>
        <tbody>
          @for (o of orders(); track o.id) {
            <tr>
              <td>{{ o.order_number }}</td>
              <td>
                {{ o.customer?.name || '—' }}<br />
                <span class="muted">{{ o.shipping.phone }}</span>
              </td>
              <td class="muted">{{ o.placed_at | date:'MMM d, h:mm a' }}</td>
              <td>{{ o.payment_method.toUpperCase() }}</td>
              <td class="num">Rs {{ o.total_amount | number }}</td>
              <td>
                <select class="input" style="padding:.35rem .6rem" [ngModel]="o.status" (ngModelChange)="changeStatus(o, $event)">
                  @for (s of statuses; track s) { <option [value]="s">{{ s.replace('_', ' ') }}</option> }
                </select>
              </td>
              <td><button class="icon-btn" (click)="toggle(o.id)">{{ openId() === o.id ? 'Hide' : 'View' }}</button></td>
            </tr>
            @if (openId() === o.id) {
              <tr><td colspan="7">
                <div class="detail">
                  <div>
                    <strong>Deliver to</strong>
                    <p class="muted">{{ o.shipping.name }} — {{ o.shipping.phone }}</p>
                    <p class="muted">{{ o.shipping.address_line_1 }}@if (o.shipping.area) {, {{ o.shipping.area }}}, {{ o.shipping.city }}</p>
                    @if (o.notes) { <p class="muted">📝 {{ o.notes }}</p> }
                  </div>
                  <div class="items">
                    @for (it of o.items; track it.id) {
                      <div class="ditem">
                        <span>{{ it.quantity }}× {{ it.name }}@if (it.variant_label) { <em> ({{ it.variant_label }})</em> }
                          @if (it.selections?.length) { <span class="muted"> — {{ it.selections!.join(', ') }}</span> }
                        </span>
                        <span>Rs {{ it.line_total | number }}</span>
                      </div>
                    }
                  </div>
                </div>
              </td></tr>
            }
          } @empty { <tr><td colspan="7" class="muted">No orders.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .detail{display:grid;grid-template-columns:1fr 1.4fr;gap:1.5rem;padding:.5rem 0}
    .detail strong{font-size:.85rem}
    .ditem{display:flex;justify-content:space-between;gap:1rem;padding:.3rem 0;font-size:.9rem;border-bottom:1px solid var(--border)}
    .ditem em{font-style:normal;color:var(--muted)}
    @media (max-width:640px){.detail{grid-template-columns:1fr}}
  `],
})
export class AdminOrders {
  private admin = inject(AdminService);

  orders = signal<AdminOrder[]>([]);
  statuses = ORDER_STATUSES;
  filterStatus = '';
  openId = signal<number | null>(null);

  constructor() { this.load(); }

  load(): void {
    this.admin.orders(this.filterStatus || undefined).subscribe({ next: o => this.orders.set(o), error: () => {} });
  }

  toggle(id: number): void { this.openId.update(v => v === id ? null : id); }

  changeStatus(o: AdminOrder, status: string): void {
    this.admin.updateOrderStatus(o.id, status).subscribe({
      next: updated => this.orders.update(list => list.map(x => x.id === o.id ? updated : x)),
      error: () => {},
    });
  }
}
