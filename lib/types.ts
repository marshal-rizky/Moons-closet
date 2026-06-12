export type ProductVariant = {
  color: string;
  hex: string;
  images: string[];
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  stock: number;
  variants: ProductVariant[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  product_id: string;
  name: string;
  size: string;
  color: string | null;
  quantity: number;
  price: number;
  image: string | null;
};

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "done";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  product_id: string;
  name: string;
  size: string;
  color: string | null;
  quantity: number;
  price: number;
  image: string | null;
  slug: string;
};
