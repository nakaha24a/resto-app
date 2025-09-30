// src/types.ts

// 画面遷移の状態を管理するための型
export type Screen =
  | "TITLE"
  | "ORDER"
  | "PAYMENT_VIEW" // ★新規: 会計選択画面を追加
  | "THANKS"; // ★ 会計完了画面

// メニュー表示用の型（quantityは不要）
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string; // メニューカテゴリ (例: パスタ, サラダ, ドリンク)
  imageUrl: string; // メニュー画像のURL (プレースホルダーを使用)
}

// 注文項目用の型（quantityが必要）
export interface OrderItem extends MenuItem {
  quantity: number;
}

// 注文オブジェクト全体の型
export interface Order {
  id: string;
  tableNumber: string; // 席番号またはタブレットID
  items: OrderItem[]; // 注文された商品（数量を含む）

  // 🚨 【App.tsxの実装に合わせて追記が必要です】
  totalAmount: number; // 注文の合計金額
  timestamp: number; // 注文が確定した時刻
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}
