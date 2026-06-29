import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <a routerLink="/admin" class="admin-brand">
          <img src="images/logo.png" alt="GEN Z Foods" />
          <span>ADMIN</span>
        </a>
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="admin-nav-link">📊 Dashboard</a>
        <a routerLink="/admin/categories" routerLinkActive="active" class="admin-nav-link">🗂️ Categories</a>
        <a routerLink="/admin/items" routerLinkActive="active" class="admin-nav-link">🍔 Items</a>
        <a routerLink="/admin/deals" routerLinkActive="active" class="admin-nav-link">🎁 Deals</a>
        <a routerLink="/admin/orders" routerLinkActive="active" class="admin-nav-link">🧾 Orders</a>
        <div class="spacer"></div>
        <a routerLink="/" class="admin-nav-link">↩ View Site</a>
        <button class="admin-nav-link" (click)="logout()">⎋ Logout</button>
      </aside>

      <div class="admin-main">
        <div class="admin-topbar">
          <h1>Gen Z Admin</h1>
          <span class="muted">{{ user()?.name }}</span>
        </div>
        <div class="admin-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AdminLayout {
  private auth = inject(AuthService);
  user = this.auth.user;

  logout(): void {
    this.auth.logout();
  }
}
