/* src/types/index.ts */

// メニュー項目の定義
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  // 文字列 または { name, price } のオブジェクトを許可
  options?: (string | { name: string; price: number })[];
  isRecommended?: boolean;
  allergens?: string[];
}

// カテゴリの定義
export interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

// メニューデータ全体の定義
export interface MenuData {
  categories: Category[];
}

// カートに入っている商品の定義
export interface CartItem extends MenuItem {
  quantity: number;
  // ★ここを修正！ string[] から変更して、オブジェクトも許可します
  selectedOptions: (string | { name: string; price: number })[];
  totalPrice: number;
}

// 注文履歴の定義
export interface Order {
  id: number;
  table_number: number;
  items: CartItem[];
  totalPrice?: number;
  totalAmount?: number;
  timestamp: string;
  status: string;
}
