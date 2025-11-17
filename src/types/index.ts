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
  allergens?: string[];
}

export interface Category {
  id: string; // ★ cartStore.ts で MenuData が categories: Category[] となっているため id を追加
  name: string;
  items: MenuItem[];
}

export interface MenuData {
  categories: Category[];
}

// --- カート関連 ---
export interface CartItem extends MenuItem {
  uniqueId: string; // カート内で一意 (menuItemId + optionsKey)
  quantity: number;
  selectedOptions: Option[];
  totalPrice: number; // (単価 + オプション価格) * 数量
}

// --- 注文関連 ---
export interface OrderItem {
  menuItemId: string; // MenuItem の 'id'
  name: string;
  price: number; // 単価
  quantity: number;
  options: Option[];
  totalPrice: number; // このアイテムの合計金額
}

export interface Order {
  id: string; // DBのID (string)
  tableNum: number; // cartStore.ts でマッピング後のキー
  items: OrderItem[]; // cartStore.ts でマッピング後のキー
  totalAmount: number; // cartStore.ts でマッピング後のキー
  timestamp: string;

  // ★ 修正: "PENDING" を server.js の定義に合わせる
  status: "調理中" | "提供済み" | "会計済み" | "キャンセル";
}
