// 参加者（メンバー）の型定義
export interface Member {
  id: number;
  name: string;
}

// 商品の型定義
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string; // ✅ 追加
}

// カート内の商品の型定義
export interface CartItem extends MenuItem {
  quantity: number;
  orderedBy: number; // 注文したメンバーのID
}

// 注文データの型定義
export interface Order {
  id: number;
  members: Member[];
  items: CartItem[];
  total: number;
  timestamp: string;
}
