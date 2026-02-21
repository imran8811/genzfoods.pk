export interface MenuItem {
  name: string;
  description: string;
  price: number;
  displayPrice: string;
  image: string;
  category: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  shipping: ShippingDetails;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'confirmed' | 'preparing' | 'on-the-way' | 'delivered';
  createdAt: Date;
}
