// src/types.ts

// 画面遷移の状態を管理するための型
export type Screen =
  | "TITLE"
  | "ORDER"
  | "CART"
  | "CHECKOUT"
  | "COMPLETE"
  | "PAYMENT_OPTIONS" // 会計オプション画面を追加
  | "SPLIT_BILL"; // 割り勘画面を追加

// メニュー表示用の型（quantityは不要）
export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

// 注文項目用の型（quantityが必要）
export interface OrderItem extends MenuItem {
  quantity: number;
}

// カート項目用の型
export type CartItem = OrderItem;

// 注文オブジェクト全体の型
export interface Order {
  id: string;
  tableNumber: string; // 席番号またはタブレットID
  items: OrderItem[]; // 注文された商品（数量を含む）
}
