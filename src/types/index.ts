// src/types/index.ts

// --- メニュー関連 ---

export interface Option {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string; // UUID or string ID
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  options: Option[];
  isRecommended: boolean;
  allergens?: string[]; // (OrderHistoryPane.tsx のために追加)
}

export interface Category {
  name: string;
  items: MenuItem[];
}

export interface MenuData {
  categories: Category[];
}

// --- カート関連 ---

export interface CartItem {
  id: string; // カート内で一意 (menuItemId + optionsId)
  menuItemId: string; // 元の MenuItem の ID
  name: string;
  price: number;
  quantity: number;
  selectedOptions: Option[];
}

// --- 注文関連 ---

// (注: OrderItem は cartStore.ts で直接定義されているため、ここでは不要かもしれないが念のため)
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: Option[];
}

export interface Order {
  id: number;
  table_number: number;
  items: CartItem[] | string; // DBからはstring, APIレスポンスではCartItem[]
  total_price: number;
  timestamp: string;

  // ★★★ エラー修正: この行を追加 ★★★
  status: string; // (例: "調理中", "提供済み")
  // ★★★ 修正ここまで ★★★
}
