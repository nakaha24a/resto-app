import { create } from "zustand";
import { MenuItem, CartItem, Order, MenuData } from "../types";

// APIのベースURL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

interface CartState {
  cart: CartItem[];
  orders: Order[];
  menuData: MenuData | null;
  menuLoading: boolean;
  error: string | null;

  // アクション
  fetchMenu: () => Promise<void>;

  // ★修正: 引数が渡されてもエラーにならないように any型で許可する
  fetchMenuData: (arg?: any) => Promise<void>;

  fetchOrders: (tableNumber: number) => Promise<void>;
  addToCart: (item: MenuItem, quantity: number, options?: string[]) => void;
  removeFromCart: (index: number) => void;
  updateCartItemQuantity: (index: number, quantity: number) => void;

  placeOrder: (tableNumber: number) => Promise<Order | null>;

  // ★修正: 引数が渡されてもエラーにならないように any型で許可する
  checkout: (arg?: any) => void;

  callStaff: (tableNumber: number) => Promise<void>;
  clearCart: () => void;
}

const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  orders: [],
  menuData: null,
  menuLoading: false,
  error: null,

  // メニュー取得
  fetchMenu: async () => {
    set({ menuLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`);
      if (!response.ok) throw new Error("メニューの読み込みに失敗しました");
      const data = await response.json();
      set({ menuData: data, menuLoading: false });
    } catch (err: any) {
      set({ error: err.message, menuLoading: false });
    }
  },

  // ★修正: 引数を受け取るが、内部では無視して fetchMenu を呼ぶ
  fetchMenuData: async (_arg?: any) => {
    await get().fetchMenu();
  },

  // 注文履歴取得
  fetchOrders: async (tableNumber: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders?tableNumber=${tableNumber}`
      );
      if (response.ok) {
        const data = await response.json();
        set({ orders: data });
      }
    } catch (err) {
      console.error("注文履歴の取得に失敗:", err);
    }
  },

  // カートに追加
  addToCart: (item, quantity, options = []) => {
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (c) =>
          c.id === item.id &&
          JSON.stringify(c.selectedOptions) === JSON.stringify(options)
      );

      if (existingIndex > -1) {
        const newCart = [...state.cart];
        newCart[existingIndex].quantity += quantity;
        newCart[existingIndex].totalPrice =
          newCart[existingIndex].price * newCart[existingIndex].quantity;
        return { cart: newCart };
      } else {
        const newItem: CartItem = {
          ...item,
          quantity,
          selectedOptions: options,
          totalPrice: item.price * quantity,
        };
        return { cart: [...state.cart, newItem] };
      }
    });
  },

  removeFromCart: (index) => {
    set((state) => ({
      cart: state.cart.filter((_, i) => i !== index),
    }));
  },

  updateCartItemQuantity: (index, quantity) => {
    set((state) => {
      const newCart = [...state.cart];
      if (quantity <= 0) {
        return { cart: newCart.filter((_, i) => i !== index) };
      }
      newCart[index].quantity = quantity;
      newCart[index].totalPrice = newCart[index].price * quantity;
      return { cart: newCart };
    });
  },

  clearCart: () => set({ cart: [] }),

  // ★修正: 引数を受け取るが無視してカートを空にする
  checkout: (_arg?: any) => set({ cart: [] }),

  // 注文確定
  placeOrder: async (tableNumber: number) => {
    const { cart } = get();
    if (cart.length === 0) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber, items: cart }),
      });

      if (!response.ok) throw new Error("注文に失敗しました");

      const newOrder = await response.json();
      set({ cart: [] });
      await get().fetchOrders(tableNumber); // 履歴を即更新
      return newOrder;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  // スタッフ呼び出し
  callStaff: async (tableNumber: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber }),
      });
      await get().fetchOrders(tableNumber);
    } catch (err) {
      console.error("スタッフ呼び出しエラー", err);
    }
  },
}));

// フック
export const useCartTotalAmount = () => {
  const cart = useCartStore((state) => state.cart);
  return cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
};

export const useTotalBillAmount = () => {
  const orders = useCartStore((state) => state.orders);
  return orders.reduce((sum, order) => {
    const price = order.totalAmount || order.totalPrice || 0;
    return sum + price;
  }, 0);
};

export default useCartStore;
