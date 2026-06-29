import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  AdminCategory, AdminDeal, AdminItem, AdminOrder, AdminStats,
} from '../models/admin.model';

interface Wrapped<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  // ----- dashboard -----
  stats(): Observable<{ stats: AdminStats; recent_orders: { data: AdminOrder[] } }> {
    return this.api.get('/admin/stats', true);
  }

  // ----- categories -----
  categories(): Observable<AdminCategory[]> {
    return this.api.get<Wrapped<AdminCategory[]>>('/admin/categories', true).pipe(map(r => r.data));
  }
  createCategory(body: Partial<AdminCategory>): Observable<AdminCategory> {
    return this.api.post<Wrapped<AdminCategory>>('/admin/categories', body, true).pipe(map(r => r.data));
  }
  updateCategory(id: number, body: Partial<AdminCategory>): Observable<AdminCategory> {
    return this.api.put<Wrapped<AdminCategory>>(`/admin/categories/${id}`, body, true).pipe(map(r => r.data));
  }
  deleteCategory(id: number): Observable<unknown> {
    return this.api.delete(`/admin/categories/${id}`, true);
  }

  // ----- items -----
  items(categoryId?: number): Observable<AdminItem[]> {
    const path = categoryId ? `/admin/items?category_id=${categoryId}` : '/admin/items';
    return this.api.get<Wrapped<AdminItem[]>>(path, true).pipe(map(r => r.data));
  }
  createItem(body: unknown): Observable<AdminItem> {
    return this.api.post<Wrapped<AdminItem>>('/admin/items', body, true).pipe(map(r => r.data));
  }
  updateItem(id: number, body: unknown): Observable<AdminItem> {
    return this.api.put<Wrapped<AdminItem>>(`/admin/items/${id}`, body, true).pipe(map(r => r.data));
  }
  deleteItem(id: number): Observable<unknown> {
    return this.api.delete(`/admin/items/${id}`, true);
  }

  // ----- deals -----
  deals(): Observable<AdminDeal[]> {
    return this.api.get<Wrapped<AdminDeal[]>>('/admin/deals', true).pipe(map(r => r.data));
  }
  createDeal(body: unknown): Observable<AdminDeal> {
    return this.api.post<Wrapped<AdminDeal>>('/admin/deals', body, true).pipe(map(r => r.data));
  }
  updateDeal(id: number, body: unknown): Observable<AdminDeal> {
    return this.api.put<Wrapped<AdminDeal>>(`/admin/deals/${id}`, body, true).pipe(map(r => r.data));
  }
  deleteDeal(id: number): Observable<unknown> {
    return this.api.delete(`/admin/deals/${id}`, true);
  }

  // ----- orders -----
  orders(status?: string): Observable<AdminOrder[]> {
    const path = status ? `/admin/orders?status=${status}` : '/admin/orders';
    return this.api.get<Wrapped<AdminOrder[]>>(path, true).pipe(map(r => r.data));
  }
  updateOrderStatus(id: number, status: string): Observable<AdminOrder> {
    return this.api.put<Wrapped<AdminOrder>>(`/admin/orders/${id}/status`, { status }, true).pipe(map(r => r.data));
  }
}
