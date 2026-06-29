export interface AdminStats {
  orders_total: number;
  orders_today: number;
  orders_pending: number;
  revenue_total: number;
  customers: number;
  items: number;
  categories: number;
  deals: number;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  type: 'single' | 'sized';
  sizes: string[] | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  items_count: number;
}

export interface AdminVariant {
  id?: number;
  label: string | null;
  price: number;
  is_available: boolean;
}

export interface AdminItem {
  id: number;
  category_id: number;
  category: { id: number; name: string; slug: string } | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_special: boolean;
  is_signature: boolean;
  is_available: boolean;
  sort_order: number;
  variants: AdminVariant[];
}

export interface AdminDeal {
  id: number;
  name: string;
  slug: string;
  group: string | null;
  description: string | null;
  price: number;
  tag: string | null;
  image_url: string | null;
  requires_selection: boolean;
  selection_size: string | null;
  selection_count: number;
  is_active: boolean;
  sort_order: number;
  extras: string[];
  option_ids: number[];
  options: { id: number; name: string; slug: string }[];
}

export interface AdminOrderItem {
  id: number;
  name: string;
  variant_label: string | null;
  selections: string[] | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  shipping: {
    name: string; phone: string; address_line_1: string;
    area: string | null; city: string; landmark: string | null;
  };
  notes: string | null;
  placed_at: string | null;
  customer: { id: number; name: string; email: string; phone: string | null } | null;
  items: AdminOrderItem[];
}

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled',
] as const;
