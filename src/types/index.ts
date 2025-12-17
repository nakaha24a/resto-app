/* src/types/index.ts */

// メニュー項目の定義
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string; // 画像はない場合もあるので ? (任意) に
  category: string;
  options?: string[]; // ★修正: シンプルに文字列の配列に変更
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
  selectedOptions: string[]; // ★修正: string[] に統一してエラー解消
  totalPrice: number;
}

// 注文履歴の定義
export interface Order {
  id: number; // ★修正: DBのIDは数値なので number
  table_number: number; // ★修正: DBのカラム名に合わせる (tableNum → table_number)
  items: CartItem[]; // 注文内容は CartItem の配列

  // ★修正: 場所によって名前が違うため、両方定義してエラーを防ぐ
  totalPrice?: number;
  totalAmount?: number;

  timestamp: string;
  status: string; // 文字列として広く許容
}
