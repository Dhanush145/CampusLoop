export interface College {
  id: number;
  name: string;
  short_name: string;
  domain: string;
  city: string;
  state: string;
  logo_url?: string;
  student_count?: number;
}

export interface StudentProfile {
  college?: College | null;
  college_name?: string;
  college_short_name?: string;
  department: string;
  year_of_study: number;
  year_display?: string;
  roll_number: string;
  bio: string;
  is_suspended: boolean;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone: string;
  is_verified: boolean;
  is_student: boolean;
  is_staff?: boolean;
  is_admin?: boolean;
  avatar?: string;
  date_joined: string;
  student_profile?: StudentProfile;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  product_count?: number;
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: string;
  original_price: string | null;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  condition_display: string;
  is_available: boolean;
  is_sold: boolean;
  is_approved: boolean;
  view_count: number;
  seller: {
    id: number;
    full_name: string;
    avatar?: string;
    college_name?: string;
  };
  seller_name?: string;
  category: number | Category;
  category_name?: string;
  category_slug?: string;
  college: number | College;
  college_name?: string;
  college_short_name?: string;
  exchange_location?: string;
  primary_image_url?: string;
  images?: ProductImage[];
  is_wishlisted?: boolean;
  enquiry_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Enquiry {
  id: number;
  product: number;
  product_detail?: Product;
  buyer: {
    id: number;
    full_name: string;
    avatar?: string;
    college_name?: string;
  };
  seller: {
    id: number;
    full_name: string;
    avatar?: string;
    college_name?: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  status_display: string;
  created_at: string;
  updated_at?: string;
}

export interface Transaction {
  id: number;
  product: number;
  product_detail: Product;
  buyer: {
    id: number;
    full_name: string;
    avatar?: string;
    college_name?: string;
  };
  seller: {
    id: number;
    full_name: string;
    avatar?: string;
    college_name?: string;
  };
  enquiry?: number;
  status: 'enquiry_sent' | 'accepted' | 'rejected' | 'reserved' | 'completed' | 'cancelled';
  status_display: string;
  price: string;
  notes: string;
  created_at: string;
  updated_at?: string;
}

export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
}

export interface Notification {
  id: number;
  notification_type: 'enquiry' | 'message' | 'transaction' | 'system';
  type_display: string;
  title: string;
  message: string;
  is_read: boolean;
  related_product?: number | null;
  related_product_title?: string | null;
  created_at: string;
}

export interface AdminStats {
  total_students: number;
  verified_students: number;
  total_products: number;
  active_products: number;
  sold_products: number;
  pending_reports: number;
  total_enquiries: number;
  completed_transactions: number;
  category_breakdown: { name: string; count: number }[];
  recent_products: Product[];
  recent_reports: { id: number; reason: string; product__title: string; reporter__full_name: string; created_at: string }[];
}

