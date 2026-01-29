/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { MenuItem, CartItem, Order, MenuData } from "../types";

// 環境変数、またはデフォルトのIPアドレス（学校用に合わせてHTTPS/443にしています）
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ;

interface CartState {
  cart: CartItem[];
  orders: Order[];
  menuData: MenuData | null;
  menuLoading: boolean;
  error: string | null;

  fetchMenu: () => Promise<void>;
  fetchMenuData: (arg?: any) => Promise<void>;
  fetchOrders: (tableNumber: number) => Promise<void>;
  addToCart: (
    item: MenuItem,
    quantity: number,
    options?: (string | { name: string; price: number })[],
  ) => void;
  removeFromCart: (index: number) => void;
  updateCartItemQuantity: (index: number, quantity: number) => void;
  placeOrder: (tableNumber: number) => Promise<Order | null>;
  checkout: (tableNumber: number) => Promise<void>;
  callStaff: (tableNumber: number) => Promise<void>;
  clearCart: () => void;
}

// オプション配列をソートして一意なキーを作成するヘルパー
const generateOptionsKey = (
  options: (string | { name: string; price: number })[],
) => {
  if (!options || options.length === 0) return "";
  const sorted = [...options].sort((a, b) => {
    const nameA = typeof a === "string" ? a : a.name;
    const nameB = typeof b === "string" ? b : b.name;
    return nameA.localeCompare(nameB);
  });
  return JSON.stringify(sorted);
};

const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  orders: [],
  menuData: null,
  menuLoading: false,
  error: null,

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

  fetchMenuData: async (_arg?: any) => {
    await get().fetchMenu();
  },

  fetchOrders: async (tableNumber: number) => {
    try {
      // サーバーから「会計済み」以外の注文だけを取得
      const response = await fetch(
        `${API_BASE_URL}/api/orders?tableNumber=${tableNumber}`,
      );
      if (response.ok) {
        const currentOrders: Order[] = await response.json();
        set({ orders: currentOrders });
      }
    } catch (err) {
      console.error("注文履歴の取得に失敗:", err);
    }
  },

  addToCart: (item, quantity, options = []) => {
    set((state) => {
      const basePrice = Number(item.price) || 0;
      const optionsPrice = options.reduce((sum, opt) => {
        if (typeof opt === "object" && opt !== null && "price" in opt) {
          return sum + (Number(opt.price) || 0);
        }
        return sum;
      }, 0);
      const unitPrice = basePrice + optionsPrice;
      const currentOptionsKey = generateOptionsKey(options);

      const existingIndex = state.cart.findIndex(
        (c) =>
          c.id === item.id &&
          generateOptionsKey(c.selectedOptions || []) === currentOptionsKey,
      );

      if (existingIndex > -1) {
        const newCart = [...state.cart];
        newCart[existingIndex].quantity += quantity;
        newCart[existingIndex].totalPrice =
          unitPrice * newCart[existingIndex].quantity;
        return { cart: newCart };
      } else {
        const newItem: CartItem = {
          ...item,
          quantity,
          // ★重要: メニュー定義の options を、ユーザーが選んだ options で上書きする！
          options: options,
          selectedOptions: options, // こっちは念のため残しておく（UI用）
          totalPrice: unitPrice * quantity,
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
      const item = newCart[index];
      const basePrice = Number(item.price) || 0;
      const optionsPrice = (item.selectedOptions || []).reduce(
        (sum: number, opt: string | { name: string; price: number }) => {
          if (typeof opt === "object" && opt !== null && "price" in opt) {
            return sum + (Number(opt.price) || 0);
          }
          return sum;
        },
        0,
      );
      newCart[index].quantity = quantity;
      newCart[index].totalPrice = (basePrice + optionsPrice) * quantity;
      return { cart: newCart };
    });
  },

  clearCart: () => set({ cart: [] }),

  /* ★ここが最重要修正ポイント！
   サーバーのDBを更新しないとKDSから消えないので、必ずfetchを行います。
  */
  checkout: async (tableNumber: number) => {
    try {
      // 1. サーバーに「このテーブルは会計済みにして！」と頼む
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber }),
      });

      if (!response.ok) throw new Error("Checkout failed");

      // 2. サーバーでの更新が成功したら、タブレットの画面もクリアする
      set({ cart: [], orders: [] });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("通信エラーが発生しました。もう一度試してください。");
    }
  },

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
      await get().fetchOrders(tableNumber);
      return newOrder;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

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

export const useCartTotalAmount = () => {
  const cart = useCartStore((state) => state.cart);
  return cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
};

export const useTotalBillAmount = () => {
  const orders = useCartStore((state) => state.orders);
  return orders.reduce((total, order) => {
    const orderTotal =
      order.totalAmount ||
      order.totalPrice ||
      (order.items || []).reduce(
        (sub, item) => sub + (item.totalPrice || 0),
        0,
      );
    return total + orderTotal;
  }, 0);
};

export const useSessionTotal = () => {
  const cartTotal = useCartTotalAmount();
  const billTotal = useTotalBillAmount();
  return billTotal + cartTotal;
};

export default useCartStore;
