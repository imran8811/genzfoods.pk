import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ApiService } from '../../../services/api.service';
import { AdminCategory, AdminItem, AdminVariant } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-items',
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="toolbar">
      <h2>Items</h2>
      <div style="display:flex;gap:.75rem;align-items:center">
        <select class="input" style="width:auto" [(ngModel)]="filterCategoryId" (ngModelChange)="load()">
          <option [ngValue]="0">All categories</option>
          @for (c of categories(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
        </select>
        <button class="btn btn-primary btn-sm" (click)="openCreate()">+ New Item</button>
      </div>
    </div>

    <div class="panel table-wrap">
      <table class="a-table">
        <thead><tr><th>Name</th><th>Category</th><th>Prices</th><th>Flags</th><th>Available</th><th></th></tr></thead>
        <tbody>
          @for (i of items(); track i.id) {
            <tr>
              <td>{{ i.name }}</td>
              <td class="muted">{{ i.category?.name }}</td>
              <td>{{ priceSummary(i) }}</td>
              <td>
                @if (i.is_signature) { <span class="badge badge-signature">Sig</span> }
                @if (i.is_special) { <span class="badge badge-special">Spc</span> }
              </td>
              <td><span class="pill" [class.on]="i.is_available" [class.off]="!i.is_available">{{ i.is_available ? 'Yes' : 'No' }}</span></td>
              <td>
                <button class="icon-btn" (click)="openEdit(i)">Edit</button>
                <button class="icon-btn danger" (click)="remove(i)">Del</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="6" class="muted">No items.</td></tr> }
        </tbody>
      </table>
    </div>

    @if (showForm()) {
      <div class="a-overlay" (click)="close()">
        <div class="a-modal" (click)="$event.stopPropagation()">
          <div class="a-modal-head"><h3>{{ editingId() ? 'Edit' : 'New' }} Item</h3><button class="icon-btn" (click)="close()">✕</button></div>
          <div class="a-grid">
            <div class="field"><label>Category</label>
              <select class="input" [(ngModel)]="categoryId">
                @for (c of categories(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
              </select>
            </div>
            <div class="field"><label>Sort order</label><input class="input" type="number" [(ngModel)]="sortOrder" /></div>
            <div class="field full"><label>Name</label><input class="input" [(ngModel)]="name" /></div>
            <div class="field full"><label>Description</label><input class="input" [(ngModel)]="description" /></div>
            <div class="field full"><label>Image URL</label><input class="input" [(ngModel)]="imageUrl" placeholder="https://…" /></div>
          </div>

          <div class="switch-row">
            <label class="switch"><input type="checkbox" [(ngModel)]="isAvailable" /> Available</label>
            <label class="switch"><input type="checkbox" [(ngModel)]="isSpecial" /> Special</label>
            <label class="switch"><input type="checkbox" [(ngModel)]="isSignature" /> Signature</label>
          </div>

          <label style="font-weight:600;font-size:.85rem;color:var(--text-2);display:block;margin:.75rem 0 .5rem">
            Variants <span class="muted">(leave label empty for single-price items)</span>
          </label>
          @for (v of variants(); track $index) {
            <div class="variant-row">
              <input class="input" placeholder="Label (e.g. Large)" [ngModel]="v.label" (ngModelChange)="setVariant($index, 'label', $event)" />
              <input class="input" type="number" placeholder="Price" [ngModel]="v.price" (ngModelChange)="setVariant($index, 'price', $event)" />
              <button class="icon-btn danger" (click)="removeVariant($index)">✕</button>
            </div>
          }
          <button class="icon-btn" (click)="addVariant()">+ Add variant</button>

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
export class AdminItems {
  private admin = inject(AdminService);
  private apiSvc = inject(ApiService);

  categories = signal<AdminCategory[]>([]);
  items = signal<AdminItem[]>([]);
  filterCategoryId = 0;

  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  error = signal('');

  categoryId = 0;
  name = '';
  description = '';
  imageUrl = '';
  isAvailable = true;
  isSpecial = false;
  isSignature = false;
  sortOrder = 0;
  variants = signal<AdminVariant[]>([]);

  constructor() {
    this.admin.categories().subscribe({
      next: c => { this.categories.set(c); if (c.length && !this.categoryId) this.categoryId = c[0].id; this.load(); },
      error: () => {},
    });
  }

  load(): void {
    this.admin.items(this.filterCategoryId || undefined).subscribe({ next: i => this.items.set(i), error: () => {} });
  }

  priceSummary(i: AdminItem): string {
    return i.variants.map(v => (v.label ? v.label + ' ' : '') + 'Rs' + v.price).join(' / ');
  }

  openCreate(): void {
    this.editingId.set(null);
    this.categoryId = this.filterCategoryId || this.categories()[0]?.id || 0;
    this.name = ''; this.description = ''; this.imageUrl = '';
    this.isAvailable = true; this.isSpecial = false; this.isSignature = false; this.sortOrder = 0;
    this.variants.set([{ label: '', price: 0, is_available: true }]);
    this.error.set(''); this.showForm.set(true);
  }

  openEdit(i: AdminItem): void {
    this.editingId.set(i.id);
    this.categoryId = i.category_id;
    this.name = i.name; this.description = i.description ?? ''; this.imageUrl = i.image_url ?? '';
    this.isAvailable = i.is_available; this.isSpecial = i.is_special; this.isSignature = i.is_signature;
    this.sortOrder = i.sort_order;
    this.variants.set(i.variants.map(v => ({ id: v.id, label: v.label ?? '', price: v.price, is_available: v.is_available })));
    this.error.set(''); this.showForm.set(true);
  }

  close(): void { this.showForm.set(false); }

  addVariant(): void { this.variants.update(v => [...v, { label: '', price: 0, is_available: true }]); }
  removeVariant(i: number): void { this.variants.update(v => v.filter((_, idx) => idx !== i)); }
  setVariant(i: number, key: 'label' | 'price', value: string | number): void {
    this.variants.update(arr => arr.map((v, idx) => idx === i ? { ...v, [key]: key === 'price' ? Number(value) : value } : v));
  }

  save(): void {
    if (!this.name.trim()) { this.error.set('Name is required.'); return; }
    const variants = this.variants().filter(v => v.price !== null && v.price !== undefined);
    if (!variants.length) { this.error.set('At least one variant with a price is required.'); return; }

    this.saving.set(true);
    const body = {
      category_id: this.categoryId,
      name: this.name.trim(),
      description: this.description || null,
      image_url: this.imageUrl || null,
      is_available: this.isAvailable,
      is_special: this.isSpecial,
      is_signature: this.isSignature,
      sort_order: this.sortOrder,
      variants: variants.map(v => ({ id: v.id, label: (v.label || '').toString().trim() || null, price: v.price, is_available: true })),
    };
    const id = this.editingId();
    const req = id ? this.admin.updateItem(id, body) : this.admin.createItem(body);
    req.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: e => { this.saving.set(false); this.error.set(this.apiSvc.getErrorMessage(e)); },
    });
  }

  remove(i: AdminItem): void {
    if (!confirm(`Delete "${i.name}"?`)) return;
    this.admin.deleteItem(i.id).subscribe({ next: () => this.load(), error: () => {} });
  }
}
