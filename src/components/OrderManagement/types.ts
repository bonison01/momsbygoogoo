/* ================= DELIVERY ADDRESS ================= */
export interface DeliveryAddress {
  full_name?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  address_line_1?: string;
  address_line_2?: string;
}

/* ================= CUSTOMER ================= */
export interface Customer {
  name: string;
  email: string | null;
  phone: string | null;
  is_guest: boolean;
}

/* ================= ORDER ================= */
export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_screenshot_url: string | null;
  delivery_address: DeliveryAddress | null;
  phone: string;
  shipping_status: string;
  courier_name: string | null;
  courier_contact: string | null;
  tracking_id: string | null;
  created_at: string;
  /* ✅ ADD THESE */
  delivery_charge?: number;
  handling_fee?: number;

  /* optional profile (registered users only) */
  user_profile?: {
    email?: string;
    full_name?: string;
  } | null;

  /* unified customer object (USE THIS IN UI) */
  customer: Customer;

  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    } | null;
  }[];
}

/* ================= EDITING ================= */
export interface EditingOrder {
  id: string;
  status: string;
  shipping_status: string;
  courier_name: string;
  courier_contact: string;
  tracking_id: string;
}
