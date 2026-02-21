export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  displayPrice: string;
  image: string;
  category: string;
}

export interface CartItem {
  id: number;
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
  id: number;
  orderNumber: string;
  items: CartItem[];
  shipping: ShippingDetails;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  total: number;
  status: string;
  createdAt: Date;
}
