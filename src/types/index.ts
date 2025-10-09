// src/types/index.ts (修正)

// オプション用の型 (トッピング、サイズ変更など)
export interface Option {
  name: string;
  price: number; // 追加料金
}

// メニュー表示用の型
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  allergens?: string[]; // アレルギー情報
  options?: {
    title: string; // 例: "トッピング", "サイズ"
    items: Option[];
  };
}

// カート内のアイテム
export interface CartItem {
  id: string; // カート内で一意のID
  menuItemId: string;
  name: string;
  price: number; // オプション料金込みの単価
  quantity: number;
  selectedOptions?: Option[]; // 選択されたオプション
}

// 注文済みのアイテム
export interface OrderItem extends MenuItem {
  quantity: number;
  selectedOptions?: Option[];
}

// 注文オブジェクト全体の型
export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  timestamp: number;
}

// 画面遷移の状態を管理するための型
export type Screen =
  | "TITLE"
  | "ORDER"
  | "CHECKOUT"
  | "COMPLETE_ORDER"
  | "PAYMENT_OPTIONS"
  | "SPLIT_BILL"
  | "COMPLETE_PAYMENT";
