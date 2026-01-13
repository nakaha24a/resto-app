import { create } from "zustand";
import { MenuItem, CartItem, Order, MenuData } from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://172.16.31.16:3000";

interface CartState {
  cart: CartItem[];
  orders: Order[];
  menuData: MenuData | null;
  menuLoading: boolean;
  error: string | null;
  lastCheckoutTime: number;

  fetchMenu: () => Promise<void>;
  fetchMenuData: (arg?: any) => Promise<void>;
  fetchOrders: (tableNumber: number) => Promise<void>;
  addToCart: (
    item: MenuItem,
    quantity: number,
    options?: (string | { name: string; price: number })[]
  ) => void;
  removeFromCart: (index: number) => void;
  updateCartItemQuantity: (index: number, quantity: number) => void;
  placeOrder: (tableNumber: number) => Promise<Order | null>;
  checkout: (tableNumber: number) => Promise<void>;
  callStaff: (tableNumber: number) => Promise<void>;
  clearCart: () => void;
}

// 最後に会計した時間をlocalStorageから取得するヘルパー
const getLastCheckoutTime = (tableNumber: number) => {
  const stored = localStorage.getItem(`resto_last_checkout_${tableNumber}`);
  return stored ? parseInt(stored, 10) : 0;
};

const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  orders: [],
  menuData: null,
  menuLoading: false,
  error: null,
  lastCheckoutTime: 0,

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
      const response = await fetch(
        `${API_BASE_URL}/api/orders?tableNumber=${tableNumber}`
      );
      if (response.ok) {
        const allOrders: Order[] = await response.json();

        // フィルタリング: 「前回の会計時間」よりあとに作られた注文だけを表示
        const checkoutTime = getLastCheckoutTime(tableNumber);

        const currentSessionOrders = allOrders.filter((order) => {
          const orderTime = new Date(order.timestamp).getTime();
          return orderTime > checkoutTime;
        });

        set({ orders: currentSessionOrders, lastCheckoutTime: checkoutTime });
      }
    } catch (err) {
      console.error("注文履歴の取得に失敗:", err);
    }
  },

  addToCart: (item, quantity, options = []) => {
    set((state) => {
      // 基本価格 + オプション価格の単価を計算
      const basePrice = Number(item.price) || 0;
      const optionsPrice = options.reduce((sum, opt) => {
        if (typeof opt === "object" && opt !== null && "price" in opt) {
          return sum + (Number(opt.price) || 0);
        }
        return sum;
      }, 0);
      const unitPrice = basePrice + optionsPrice;

      // ★重要: カート内に「同じ商品」かつ「同じオプション」のものがあるか探す
      // ※ JSON.stringify で配列の中身（オプションの組み合わせ）を文字列化して比較します
      // ※ 念のためオプション配列をソートしてから比較するとより安全です
      const optionsKey = JSON.stringify(options.sort());

      const existingIndex = state.cart.findIndex(
        (c) =>
          c.id === item.id &&
          // ★ここでオプションの一致を確認！
          JSON.stringify((c.selectedOptions || []).sort()) === optionsKey
      );

      if (existingIndex > -1) {
        // A. 全く同じオプションの商品があった場合 → 数量だけ増やす
        // (例: 「カルボナーラ大盛」が既にあり、さらに「カルボナーラ大盛」を追加した)
        const newCart = [...state.cart];
        newCart[existingIndex].quantity += quantity;
        newCart[existingIndex].totalPrice =
          unitPrice * newCart[existingIndex].quantity;
        return { cart: newCart };
      } else {
        // B. 同じ商品がない、またはオプションが違う場合 → 新しい行として追加
        // (例: 「カルボナーラ大盛」はあるが、今入れたのは「カルボナーラ普通」)
        const newItem: CartItem = {
          ...item,
          quantity,
          selectedOptions: options as any,
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
        (sum: number, opt: any) => {
          if (typeof opt === "object" && opt !== null && "price" in opt) {
            return sum + (Number(opt.price) || 0);
          }
          return sum;
        },
        0
      );

      newCart[index].quantity = quantity;
      newCart[index].totalPrice = (basePrice + optionsPrice) * quantity;
      return { cart: newCart };
    });
  },

  clearCart: () => set({ cart: [] }),

  // ★修正箇所: ここから fetch を完全に削除しました
  checkout: async (tableNumber: number) => {
    const now = Date.now();
    // 1. ローカルストレージに今の時間を記録（これが「区切り」になります）
    localStorage.setItem(`resto_last_checkout_${tableNumber}`, now.toString());

    // 2. 画面の状態をリセット
    set({ cart: [], orders: [], lastCheckoutTime: now });

    // 通信処理は一切書きません！
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
        0
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
