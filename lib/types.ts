export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  kind: "hair" | "care";
  sort_order: number;
  is_active: boolean;
};

export type Variant = {
  id: string;
  product_id: string;
  length_inches: number | null;
  color: string | null;
  label: string | null;
  price_kobo: number;
  in_stock: boolean;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  categories?: Pick<Category, "name" | "slug" | "kind"> | null;
  product_variants?: Variant[];
};

export type Order = {
  id: string;
  reference: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  note: string | null;
  subtotal_kobo: number;
  delivery_kobo: number;
  total_kobo: number;
  status: "pending" | "paid" | "failed" | "fulfilled" | "cancelled";
  paid_at: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  length_inches: number | null;
  color: string | null;
  label: string | null;
  unit_price_kobo: number;
  quantity: number;
};
