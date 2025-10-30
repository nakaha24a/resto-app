// src/types/index.ts

export interface Option {
  name: string;
  price: number;
}

// ★ Category と MenuData を追加
export interface Category {
  name: string;
  items: MenuItem[];
}

export interface MenuData {
  categories: Category[];
}

export interface MenuItem {
  id: string; // 商品固有ID
  name: string; // 商品名
  description?: string; // 商品説明 (任意)
  price: number; // 価格
  image?: string; // ★ 画像パス (任意) を追加 (imageUrl ではなく image)
  category: string; // カテゴリ名
  options?: Option[]; // オプション (任意)
  isRecommended?: boolean; // おすすめ商品フラグ (任意)
  allergens?: string[]; // ★ アレルゲン情報 (任意) を追加
}

export interface CartItem {
  id: string; // カート内でのユニークID (menuItemId + optionsId)
  menuItemId: string; // 元のMenuItemのID
  name: string;
  price: number; // MenuItemの基本価格
  quantity: number;
  selectedOptions?: Option[]; // 選択されたオプション
  // image?: string; // ★ MenuItem から image を取得するので、ここでは不要な場合が多い
}

export interface OrderItem {
  id: string; // MenuItemのID
  name: string;
  price: number; // 単価
  quantity: number;
  selectedOptions?: Option[];
}

export interface Order {
  id: number; // 注文ID
  table_number: number; // ★ DBスキーマに合わせる (例)
  items: string; // ★ JSON 文字列
  total_price: number; // ★ DBスキーマに合わせる (例)
  timestamp: string; // 注文日時
}

// 支払い方法の型定義 (例)
export type PaymentMethod = "cash" | "creditCard" | "eMoney";

// 画面の状態を示す型 (App.tsx などで使用)
export type AppScreen = "order" | "paymentOptions" | "splitBill" | "thanks";
