import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MenuItem } from '../models/menu-item.model';

interface ApiFoodItem {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  category?: string;
}

interface FoodItemsResponse {
  items: ApiFoodItem[];
}

@Injectable({
  providedIn: 'root',
})
export class FoodCatalogService {
  private api = inject(ApiService);

  getFoodItems(): Observable<MenuItem[]> {
    return this.api.get<FoodItemsResponse>('/food-items').pipe(
      map(response =>
        response.items.map(item => {
          const numericPrice = Number(item.price);
          return {
            id: item.id,
            name: item.name,
            description: item.description ?? 'Freshly prepared and served hot.',
            price: numericPrice,
            displayPrice: `Rs. ${numericPrice.toLocaleString()}`,
            image:
              item.image_url ||
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
            category: item.category ?? 'Menu',
          } satisfies MenuItem;
        })
      )
    );
  }
}