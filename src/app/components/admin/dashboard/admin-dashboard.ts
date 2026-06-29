import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AdminOrder, AdminStats } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DecimalPipe, RouterLink],
  template: `
    <h2 class="toolbar"><span>Dashboard</span></h2>

    @if (stats(); as s) {
      <div class="stat-grid">
        <div class="stat-card"><div class="label">Total Orders</div><div class="value">{{ s.orders_total }}</div></div>
        <div class="stat-card"><div class="label">Orders Today</div><div class="value">{{ s.orders_today }}</div></div>
        <div class="stat-card"><div class="label">Pending</div><div class="value">{{ s.orders_pending }}</div></div>
        <div class="stat-card"><div class="label">Revenue</div><div class="value">Rs {{ s.revenue_total | number }}</div></div>
        <div class="stat-card"><div class="label">Customers</div><div class="value">{{ s.customers }}</div></div>
        <div class="stat-card"><div class="label">Menu Items</div><div class="value">{{ s.items }}</div></div>
        <div class="stat-card"><div class="label">Categories</div><div class="value">{{ s.categories }}</div></div>
        <div class="stat-card"><div class="label">Deals</div><div class="value">{{ s.deals }}</div></div>
      </div>
    }

    <div class="panel">
      <div class="toolbar"><h2>Recent Orders</h2><a routerLink="/admin/orders" class="icon-btn">View all</a></div>
      <div class="table-wrap">
        <table class="a-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th class="num">Total</th><th>Status</th></tr></thead>
          <tbody>
            @for (o of recent(); track o.id) {
              <tr>
                <td>{{ o.order_number }}</td>
                <td>{{ o.customer?.name || '—' }}</td>
                <td>{{ o.items.length }}</td>
                <td class="num">Rs {{ o.total_amount | number }}</td>
                <td><span class="pill" [class]="'pill ' + o.status">{{ o.status.replace('_', ' ') }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="muted">No orders yet.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminDashboard {
  private admin = inject(AdminService);

  stats = signal<AdminStats | null>(null);
  recent = signal<AdminOrder[]>([]);

  constructor() {
    this.admin.stats().subscribe({
      next: r => { this.stats.set(r.stats); this.recent.set(r.recent_orders.data); },
      error: () => {},
    });
  }
}
