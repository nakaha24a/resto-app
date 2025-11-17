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

/**
 * ★ 修正: CartItem が MenuItem の全プロパティを継承 (extends) するように変更。
 * これにより、MenuItem の id, name, price などが CartItem でも使えるようになります。
 * cartStore.ts のロジックで必要なプロパティ (uniqueId, totalPrice) を追加。
 */
export interface CartItem extends MenuItem {
  uniqueId: string; // カート内で一意 (menuItemId + optionsKey)
  quantity: number;
  selectedOptions: Option[];
  totalPrice: number; // (単価 + オプション価格) * 数量
}

// --- 注文関連 ---

/**
 * ★ 修正: cartStore.ts の placeOrder で送信するデータ構造に合わせる
 */
export interface OrderItem {
  menuItemId: string; // MenuItem の 'id'
  name: string;
  price: number; // 単価
  quantity: number;
  options: Option[]; // selectedOptions から 'options' に変更
  totalPrice: number; // このアイテムの合計金額
}

/**
 * ★ 修正: cartStore.ts のロジック (API送受信) に型を合わせる
 */
export interface Order {
  id: string; // DBのID (通常 string)
  tableNum: number; // table_number から変更
  items: OrderItem[]; // CartItem[] | string から OrderItem[] に変更
  totalAmount: number; // total_price から変更
  timestamp: string; // createdAt や timestamp
  status: "PENDING" | "COMPLETED" | "CANCELLED"; // string から具体的なステータスに変更
}
