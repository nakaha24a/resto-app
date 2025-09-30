// src/types.ts

// 画面遷移の状態を管理するための型
export type Screen =
  | "TITLE"
  | "PARTY_INPUT" // 初期画面から席番号入力へ遷移
  | "ORDER"
  | "CART"
  | "CHECKOUT"
  | "COMPLETE"
  | "PAYMENT_OPTIONS" // 会計オプション画面（今回作成はスキップ）
  | "SPLIT_BILL"; // 割り勘画面

// メニュー表示用の型
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string; // メニューカテゴリ
  imageUrl: string; // メニュー画像のURL
}

// カート項目用の型
export interface CartItem {
  id: string; // ユニークなカートアイテムID（ここでは menuId と同じにして簡略化）
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

// 注文オブジェクト全体の型（確定済み注文）
export interface Order {
  id: string; // 注文ID
  tableNumber: string; // 席番号
  items: CartItem[]; // 注文された商品（数量を含む）
  totalAmount: number;
  timestamp: number;
}
