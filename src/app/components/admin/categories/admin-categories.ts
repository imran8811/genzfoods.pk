import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ApiService } from '../../../services/api.service';
import { AdminCategory } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule],
  template: `
    <div class="toolbar">
      <h2>Categories</h2>
      <button class="btn btn-primary btn-sm" (click)="openCreate()">+ New Category</button>
    </div>

    <div class="panel table-wrap">
      <table class="a-table">
        <thead><tr><th>Name</th><th>Type</th><th>Sizes</th><th>Items</th><th>Active</th><th></th></tr></thead>
        <tbody>
          @for (c of categories(); track c.id) {
            <tr>
              <td>{{ c.name }}</td>
              <td>{{ c.type }}</td>
              <td class="muted">{{ c.sizes?.join(', ') || '—' }}</td>
              <td>{{ c.items_count }}</td>
              <td><span class="pill" [class.on]="c.is_active" [class.off]="!c.is_active">{{ c.is_active ? 'Active' : 'Hidden' }}</span></td>
              <td>
                <button class="icon-btn" (click)="openEdit(c)">Edit</button>
                <button class="icon-btn danger" (click)="remove(c)">Del</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="6" class="muted">No categories.</td></tr> }
        </tbody>
      </table>
    </div>

    @if (showForm()) {
      <div class="a-overlay" (click)="close()">
        <div class="a-modal" (click)="$event.stopPropagation()">
          <div class="a-modal-head"><h3>{{ editingId() ? 'Edit' : 'New' }} Category</h3><button class="icon-btn" (click)="close()">✕</button></div>
          <div class="a-grid">
            <div class="field full"><label>Name</label><input class="input" [(ngModel)]="name" /></div>
            <div class="field"><label>Type</label>
              <select class="input" [(ngModel)]="type"><option value="single">single</option><option value="sized">sized</option></select>
            </div>
            <div class="field"><label>Sort order</label><input class="input" type="number" [(ngModel)]="sortOrder" /></div>
            @if (type === 'sized') {
              <div class="field full"><label>Sizes (comma separated)</label><input class="input" [(ngModel)]="sizesText" placeholder="Small, Medium, Large" /></div>
            }
            <div class="field full">
              <label class="switch"><input type="checkbox" [(ngModel)]="isActive" /> Active</label>
            </div>
          </div>
          @if (error()) { <p class="err">{{ error() }}</p> }
          <div class="a-modal-foot">
            <button class="btn btn-ghost btn-sm" (click)="close()">Cancel</button>
            <button class="btn btn-primary btn-sm" (click)="save()" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`.err{color:#ff7a84;font-weight:600;margin-top:.5rem}`],
})
export class AdminCategories {
  private admin = inject(AdminService);
  private apiSvc = inject(ApiService);

  categories = signal<AdminCategory[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  error = signal('');

  name = '';
  type: 'single' | 'sized' = 'single';
  sizesText = '';
  sortOrder = 0;
  isActive = true;

  constructor() { this.load(); }

  private load(): void {
    this.admin.categories().subscribe({ next: c => this.categories.set(c), error: () => {} });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.name = ''; this.type = 'single'; this.sizesText = ''; this.sortOrder = 0; this.isActive = true;
    this.error.set(''); this.showForm.set(true);
  }

  openEdit(c: AdminCategory): void {
    this.editingId.set(c.id);
    this.name = c.name; this.type = c.type; this.sizesText = (c.sizes ?? []).join(', ');
    this.sortOrder = c.sort_order; this.isActive = c.is_active;
    this.error.set(''); this.showForm.set(true);
  }

  close(): void { this.showForm.set(false); }

  save(): void {
    if (!this.name.trim()) { this.error.set('Name is required.'); return; }
    this.saving.set(true);
    const body = {
      name: this.name.trim(),
      type: this.type,
      sizes: this.type === 'sized'
        ? this.sizesText.split(',').map(s => s.trim()).filter(Boolean)
        : null,
      sort_order: this.sortOrder,
      is_active: this.isActive,
    };
    const id = this.editingId();
    const req = id ? this.admin.updateCategory(id, body) : this.admin.createCategory(body);
    req.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: e => { this.saving.set(false); this.error.set(this.apiSvc.getErrorMessage(e)); },
    });
  }

  remove(c: AdminCategory): void {
    if (!confirm(`Delete "${c.name}" and its ${c.items_count} item(s)?`)) return;
    this.admin.deleteCategory(c.id).subscribe({ next: () => this.load(), error: () => {} });
  }
}
