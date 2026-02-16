import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  categories = [
    {
      name: 'Pizza',
      description: 'Hand-tossed, stone-baked pizza with premium toppings',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
      emoji: '🍕'
    },
    {
      name: 'Burgers',
      description: 'Juicy smashed burgers with signature sauces',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
      emoji: '🍔'
    },
    {
      name: 'Wraps',
      description: 'Fresh tortilla wraps loaded with flavor',
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop',
      emoji: '🌯'
    },
    {
      name: 'Pasta',
      description: 'Creamy and classic Italian pasta dishes',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
      emoji: '🍝'
    },
    {
      name: 'Sandwiches',
      description: 'Gourmet sandwiches crafted to perfection',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop',
      emoji: '🥪'
    },
    {
      name: 'Paratha Rolls',
      description: 'Flaky paratha stuffed with spiced fillings & chutneys',
      image: 'https://images.unsplash.com/photo-1632788843852-b3056740c914?w=600&h=400&fit=crop',
      emoji: '🫓'
    }
  ];
}
