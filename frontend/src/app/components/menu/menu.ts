import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from '../../models/menu-item.model';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-menu',
    imports: [RouterLink],
    templateUrl: './menu.html',
    styleUrl: './menu.scss',
})
export class Menu {
    private cartService = inject(CartService);

    categories = ['All', 'Pizza', 'Burgers', 'Wraps', 'Pasta', 'Sandwiches', 'Paratha Rolls'];
    activeCategory = signal('All');
    addedItem = signal<string | null>(null);

    menuItems: MenuItem[] = [
        // Pizza
        { name: 'Margherita', description: 'Fresh mozzarella, basil, and tomato sauce on crispy dough', price: 999, displayPrice: 'Rs. 999', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', category: 'Pizza' },
        { name: 'Pepperoni Feast', description: 'Loaded pepperoni with extra cheese and Italian herbs', price: 1299, displayPrice: 'Rs. 1,299', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', category: 'Pizza' },
        { name: 'BBQ Chicken', description: 'Grilled chicken, BBQ sauce, red onion, and cilantro', price: 1399, displayPrice: 'Rs. 1,399', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'Pizza' },
        { name: 'Veggie Supreme', description: 'Bell peppers, mushrooms, olives, onions, and tomatoes', price: 1099, displayPrice: 'Rs. 1,099', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop', category: 'Pizza' },
        { name: 'Meat Lovers', description: 'Beef, pepperoni, sausage, and bacon with mozzarella', price: 1499, displayPrice: 'Rs. 1,499', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', category: 'Pizza' },

        // Burgers
        { name: 'Classic Smash', description: 'Double smashed beef patties, American cheese, pickles', price: 699, displayPrice: 'Rs. 699', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', category: 'Burgers' },
        { name: 'Spicy Zinger', description: 'Crispy fried chicken with spicy mayo and jalapenos', price: 599, displayPrice: 'Rs. 599', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop', category: 'Burgers' },
        { name: 'Mushroom Swiss', description: 'Beef patty topped with sautéed mushrooms and Swiss cheese', price: 799, displayPrice: 'Rs. 799', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop', category: 'Burgers' },
        { name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce, crispy bacon, cheddar, onion rings', price: 849, displayPrice: 'Rs. 849', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop', category: 'Burgers' },
        { name: 'Chicken Avocado', description: 'Grilled chicken breast, fresh avocado, lettuce, tomato', price: 749, displayPrice: 'Rs. 749', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop', category: 'Burgers' },

        // Wraps
        { name: 'Chicken Shawarma', description: 'Marinated chicken, garlic sauce, pickles, and fries in pita', price: 499, displayPrice: 'Rs. 499', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', category: 'Wraps' },
        { name: 'Falafel Wrap', description: 'Crispy falafel, hummus, tahini, fresh veggies', price: 449, displayPrice: 'Rs. 449', image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=400&h=300&fit=crop', category: 'Wraps' },
        { name: 'Grilled Beef Wrap', description: 'Tender grilled beef strips with peppers and onions', price: 549, displayPrice: 'Rs. 549', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop', category: 'Wraps' },
        { name: 'Caesar Chicken Wrap', description: 'Grilled chicken, Caesar dressing, parmesan, romaine', price: 499, displayPrice: 'Rs. 499', image: 'https://images.unsplash.com/photo-1632056023556-a89148b29fdd?w=400&h=300&fit=crop', category: 'Wraps' },
        { name: 'Spicy Tikka Wrap', description: 'Tikka marinated chicken, mint chutney, onion rings', price: 529, displayPrice: 'Rs. 529', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop', category: 'Wraps' },

        // Pasta
        { name: 'Creamy Alfredo', description: 'Rich and creamy Alfredo sauce with fettuccine pasta', price: 799, displayPrice: 'Rs. 799', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', category: 'Pasta' },
        { name: 'Penne Arrabbiata', description: 'Spicy tomato sauce with garlic, chili flakes, basil', price: 699, displayPrice: 'Rs. 699', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', category: 'Pasta' },
        { name: 'Chicken Carbonara', description: 'Creamy egg sauce, crispy chicken, parmesan, black pepper', price: 899, displayPrice: 'Rs. 899', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', category: 'Pasta' },
        { name: 'Mac & Cheese', description: 'Baked elbow macaroni in four-cheese sauce, golden top', price: 649, displayPrice: 'Rs. 649', image: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400&h=300&fit=crop', category: 'Pasta' },
        { name: 'Spaghetti Bolognese', description: 'Classic meat sauce with herbs and parmesan over spaghetti', price: 849, displayPrice: 'Rs. 849', image: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=400&h=300&fit=crop', category: 'Pasta' },

        // Sandwiches
        { name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, egg, lettuce, tomato', price: 549, displayPrice: 'Rs. 549', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', category: 'Sandwiches' },
        { name: 'Philly Cheesesteak', description: 'Thinly sliced beef, melted provolone, peppers, onions', price: 649, displayPrice: 'Rs. 649', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop', category: 'Sandwiches' },
        { name: 'Grilled Panini', description: 'Pressed panini with mozzarella, sun-dried tomato, pesto', price: 499, displayPrice: 'Rs. 499', image: 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=400&h=300&fit=crop', category: 'Sandwiches' },
        { name: 'BLT Classic', description: 'Crispy bacon, fresh lettuce, tomato, mayo on toasted bread', price: 449, displayPrice: 'Rs. 449', image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&h=300&fit=crop', category: 'Sandwiches' },
        { name: 'Chicken Melt', description: 'Grilled chicken, melted cheddar, caramelized onions', price: 549, displayPrice: 'Rs. 549', image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop', category: 'Sandwiches' },

        // Paratha Rolls
        { name: 'Chicken Tikka Roll', description: 'Smoky tikka chicken, onions, chutney wrapped in flaky paratha', price: 399, displayPrice: 'Rs. 399', image: 'https://images.unsplash.com/photo-1632788843852-b3056740c914?w=400&h=300&fit=crop', category: 'Paratha Rolls' },
        { name: 'Seekh Kebab Roll', description: 'Juicy beef seekh kebab, mint raita, salad in crispy paratha', price: 449, displayPrice: 'Rs. 449', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400&h=300&fit=crop', category: 'Paratha Rolls' },
        { name: 'Egg Paratha Roll', description: 'Spiced omelette, tangy chutney, fresh onions in golden paratha', price: 299, displayPrice: 'Rs. 299', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop', category: 'Paratha Rolls' },
        { name: 'Paneer Tikka Roll', description: 'Marinated paneer cubes, bell peppers, spicy mayo in paratha', price: 379, displayPrice: 'Rs. 379', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&h=300&fit=crop', category: 'Paratha Rolls' },
        { name: 'Chapli Kebab Roll', description: 'Spiced chapli kebab, pickled onions, green chutney in paratha', price: 429, displayPrice: 'Rs. 429', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop', category: 'Paratha Rolls' },
    ];

    filteredItems = computed(() => {
        const cat = this.activeCategory();
        if (cat === 'All') return this.menuItems;
        return this.menuItems.filter(item => item.category === cat);
    });

    cartItemCount = this.cartService.itemCount;

    setCategory(category: string) {
        this.activeCategory.set(category);
    }

    addToCart(item: MenuItem) {
        this.cartService.addItem(item);
        this.addedItem.set(item.name);
        setTimeout(() => this.addedItem.set(null), 1500);
    }

    getQuantity(itemName: string): number {
        return this.cartService.getItemQuantity(itemName);
    }
}
