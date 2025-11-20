// src/types/index.ts

export interface Option {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  options: Option[];
  isRecommended: boolean;
  allergens?: string[];
}

export interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuData {
  categories: Category[];
}

export interface CartItem extends MenuItem {
  uniqueId: string;
  quantity: number;
  selectedOptions: Option[];
  totalPrice: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options: Option[];
  totalPrice: number;
}

export interface Order {
  id: string;
  // ★ 修正: string から number に戻す
  tableNum: number;
  items: OrderItem[];
  totalAmount: number;
  timestamp: string;
  // ★ 追加: "注文受付"
  status: "注文受付" | "調理中" | "提供済み" | "会計済み" | "キャンセル";
}
