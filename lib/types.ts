export type VariantSize = {
  size: string;
  stock: number;
};

export type ProductVariant = {
  color: string;
  hex: string;
  images: string[];
  sizes: VariantSize[]; // per-size stock for this color
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

export type PaymentMethod = "online" | "whatsapp";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "expired";

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
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  midtrans_order_id: string | null;
  midtrans_transaction_id: string | null;
  paid_at: string | null;
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
