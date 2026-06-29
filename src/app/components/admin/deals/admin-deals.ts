import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ApiService } from '../../../services/api.service';
import { AdminDeal, AdminItem } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-deals',
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="toolbar">
      <h2>Deals</h2>
      <button class="btn btn-primary btn-sm" (click)="openCreate()">+ New Deal</button>
    </div>

    <div class="panel table-wrap">
      <table class="a-table">
        <thead><tr><th>Name</th><th>Group</th><th class="num">Price</th><th>Selection</th><th>Active</th><th></th></tr></thead>
        <tbody>
          @for (d of deals(); track d.id) {
            <tr>
              <td>{{ d.name }}@if (d.tag) { <span class="badge badge-special" style="margin-left:.4rem">{{ d.tag }}</span> }</td>
              <td class="muted">{{ d.group }}</td>
              <td class="num">Rs {{ d.price | number }}</td>
              <td class="muted">{{ d.requires_selection ? (d.selection_count + ' × ' + d.selection_size) : '—' }}</td>
              <td><span class="pill" [class.on]="d.is_active" [class.off]="!d.is_active">{{ d.is_active ? 'Active' : 'Hidden' }}</span></td>
              <td>
                <button class="icon-btn" (click)="openEdit(d)">Edit</button>
                <button class="icon-btn danger" (click)="remove(d)">Del</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="6" class="muted">No deals.</td></tr> }
        </tbody>
      </table>
    </div>

    @if (showForm()) {
      <div class="a-overlay" (click)="close()">
        <div class="a-modal" (click)="$event.stopPropagation()">
          <div class="a-modal-head"><h3>{{ editingId() ? 'Edit' : 'New' }} Deal</h3><button class="icon-btn" (click)="close()">✕</button></div>
          <div class="a-grid">
            <div class="field"><label>Name</label><input class="input" [(ngModel)]="name" /></div>
            <div class="field"><label>Group</label><input class="input" [(ngModel)]="group" placeholder="Pizza Deals" /></div>
            <div class="field"><label>Price</label><input class="input" type="number" [(ngModel)]="price" /></div>
            <div class="field"><label>Tag</label><input class="input" [(ngModel)]="tag" placeholder="Special" /></div>
            <div class="field full"><label>Description</label><input class="input" [(ngModel)]="description" /></div>
            <div class="field"><label>Sort order</label><input class="input" type="number" [(ngModel)]="sortOrder" /></div>
          </div>

          <div class="switch-row">
            <label class="switch"><input type="checkbox" [(ngModel)]="isActive" /> Active</label>
            <label class="switch"><input type="checkbox" [(ngModel)]="requiresSelection" /> Customer picks pizzas</label>
          </div>

          @if (requiresSelection) {
            <div class="a-grid">
              <div class="field"><label>Pizza size</label><input class="input" [(ngModel)]="selectionSize" placeholder="Large" /></div>
              <div class="field"><label>How many</label><input class="input" type="number" [(ngModel)]="selectionCount" /></div>
            </div>
            <label style="font-weight:600;font-size:.85rem;color:var(--text-2);display:block;margin:.5rem 0">Selectable pizzas</label>
            <div class="opt-chips">
              @for (it of pizzaItems(); track it.id) {
                <span class="opt-chip" [class.on]="optionIds().includes(it.id)" (click)="toggleOption(it.id)">{{ it.name }}</span>
              }
            </div>
          }

          <div class="field full" style="margin-top:.9rem"><label>Bundled extras (comma separated)</label>
            <input class="input" [(ngModel)]="extrasText" placeholder="Drink 1.5Ltr, 1 Regular Fries" />
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
export class AdminDeals {
  private admin = inject(AdminService);
  private apiSvc = inject(ApiService);

  deals = signal<AdminDeal[]>([]);
  pizzaItems = signal<AdminItem[]>([]);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  error = signal('');

  name = '';
  group = '';
  description = '';
  price = 0;
  tag = '';
  sortOrder = 0;
  isActive = true;
  requiresSelection = false;
  selectionSize = '';
  selectionCount = 1;
  extrasText = '';
  optionIds = signal<number[]>([]);

  constructor() {
    this.load();
    // Pizzas are the selectable options for deals.
    this.admin.categories().subscribe({
      next: cats => {
        const pizza = cats.find(c => c.slug === 'pizza');
        this.admin.items(pizza?.id).subscribe({ next: i => this.pizzaItems.set(i), error: () => {} });
      },
      error: () => {},
    });
  }

  private load(): void {
    this.admin.deals().subscribe({ next: d => this.deals.set(d), error: () => {} });
  }

  toggleOption(id: number): void {
    this.optionIds.update(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.name = ''; this.group = ''; this.description = ''; this.price = 0; this.tag = '';
    this.sortOrder = 0; this.isActive = true; this.requiresSelection = false;
    this.selectionSize = ''; this.selectionCount = 1; this.extrasText = ''; this.optionIds.set([]);
    this.error.set(''); this.showForm.set(true);
  }

  openEdit(d: AdminDeal): void {
    this.editingId.set(d.id);
    this.name = d.name; this.group = d.group ?? ''; this.description = d.description ?? '';
    this.price = d.price; this.tag = d.tag ?? ''; this.sortOrder = d.sort_order; this.isActive = d.is_active;
    this.requiresSelection = d.requires_selection; this.selectionSize = d.selection_size ?? '';
    this.selectionCount = d.selection_count; this.extrasText = d.extras.join(', ');
    this.optionIds.set([...d.option_ids]);
    this.error.set(''); this.showForm.set(true);
  }

  close(): void { this.showForm.set(false); }

  save(): void {
    if (!this.name.trim()) { this.error.set('Name is required.'); return; }
    this.saving.set(true);
    const body = {
      name: this.name.trim(),
      group: this.group || null,
      description: this.description || null,
      price: this.price,
      tag: this.tag || null,
      sort_order: this.sortOrder,
      is_active: this.isActive,
      requires_selection: this.requiresSelection,
      selection_size: this.requiresSelection ? (this.selectionSize || null) : null,
      selection_count: this.selectionCount || 1,
      extras: this.extrasText.split(',').map(s => s.trim()).filter(Boolean),
      option_ids: this.requiresSelection ? this.optionIds() : [],
    };
    const id = this.editingId();
    const req = id ? this.admin.updateDeal(id, body) : this.admin.createDeal(body);
    req.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: e => { this.saving.set(false); this.error.set(this.apiSvc.getErrorMessage(e)); },
    });
  }

  remove(d: AdminDeal): void {
    if (!confirm(`Delete "${d.name}"?`)) return;
    this.admin.deleteDeal(d.id).subscribe({ next: () => this.load(), error: () => {} });
  }
}
