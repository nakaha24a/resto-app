import { create } from "zustand";
import {
  CartItem,
  MenuItem,
  Option,
  Order,
  MenuData,
  OrderItem,
} from "../types";

// CRA用の環境変数設定
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

interface CartState {
  cart: CartItem[];
  orders: Order[];
  // 互換用
  pendingOrders: Order[];
  orderHistory: Order[];

  menuData: MenuData | null;
  loading: boolean;
  menuLoading: boolean;
  error: string | null;

  fetchMenuData: () => Promise<void>;
  updateCart: (item: MenuItem, quantity: number, options: Option[]) => void;
  removeFromCart: (uniqueId: string) => void;
  clearCart: () => void;

  placeOrder: (tableNum: number) => Promise<Order | null>;
  fetchOrders: (tableNum: number) => Promise<void>;
  callStaff: (tableNum: number) => Promise<boolean>;

  // 支払い完了処理
  checkout: (tableNum: number) => Promise<void>;

  // 互換用
  clearPendingOrders: () => void;
}

const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  orders: [],
  pendingOrders: [],
  orderHistory: [],

  menuData: null,
  loading: false,
  menuLoading: false,
  error: null,

  fetchMenuData: async () => {
    if (get().menuData) return;
    set({ menuLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`);
      if (!response.ok) throw new Error("Error");
      const data: MenuData = await response.json();
      set({ menuData: data, menuLoading: false });
    } catch (err) {
      set({ error: "メニュー取得失敗", menuLoading: false });
    }
  },

  updateCart: (item, quantity, selectedOptions) =>
    set((state) => {
      const optionsKey = selectedOptions
        .map((opt) => opt.name)
        .sort()
        .join("-");
      const uniqueId = `${item.id}_${optionsKey || "default"}`;
      const existingItemIndex = state.cart.findIndex(
        (c) => c.uniqueId === uniqueId
      );
      let newCart = [...state.cart];
      const optionsTotalPrice = selectedOptions.reduce(
        (t, o) => t + o.price,
        0
      );

      if (existingItemIndex > -1) {
        const newQuantity = newCart[existingItemIndex].quantity + quantity;
        if (newQuantity <= 0) newCart.splice(existingItemIndex, 1);
        else {
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newQuantity,
            totalPrice: (item.price + optionsTotalPrice) * newQuantity,
          };
        }
      } else if (quantity > 0) {
        newCart.push({
          ...item,
          uniqueId,
          quantity,
          selectedOptions,
          totalPrice: (item.price + optionsTotalPrice) * quantity,
        });
      }
      return { cart: newCart };
    }),

  removeFromCart: (uniqueId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.uniqueId !== uniqueId),
    })),

  clearCart: () => set({ cart: [] }),

  placeOrder: async (tableNum: number) => {
    const { cart } = get();
    set({ loading: true, error: null });
    try {
      const orderDetails: OrderItem[] = cart.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        options: item.selectedOptions,
        totalPrice: item.totalPrice,
      }));

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: tableNum,
          items: orderDetails,
        }),
      });

      if (!response.ok) throw new Error("注文失敗");

      // 注文成功後、最新データを取得
      await get().fetchOrders(tableNum);

      set({ cart: [], loading: false });

      return {
        id: "success",
        tableNum,
        items: [],
        totalAmount: 0,
        timestamp: new Date().toISOString(),
        status: "注文受付",
      };
    } catch (err) {
      set({ error: "注文送信エラー", loading: false });
      return null;
    }
  },

  fetchOrders: async (tableNum: number) => {
    try {
      // キャッシュ防止のためにタイムスタンプをつける
      const response = await fetch(
        `${API_BASE_URL}/api/orders?tableNumber=${tableNum}&_t=${Date.now()}`
      );
      if (!response.ok) throw new Error("履歴取得失敗");
      const ordersResponse: any[] = await response.json();

      const mappedOrders: Order[] = ordersResponse.map((order) => ({
        id: order.id.toString(),
        tableNum: Number(order.table_number),
        items: JSON.parse(order.items || "[]"),
        totalAmount: order.total_price,
        timestamp: order.timestamp,
        status: order.status,
      }));

      // 会計済みのものは除外されている前提だが、念のためフィルタリング
      const activeOrders = mappedOrders.filter((o) => o.status !== "会計済み");

      set({
        orders: activeOrders,
        pendingOrders: activeOrders,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  callStaff: async (tableNum: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber: tableNum }),
      });
      return response.ok;
    } catch (err) {
      return false;
    }
  },

  // サーバー上の注文を全て「会計済み」にする
  checkout: async (tableNum: number) => {
    const { orders } = get();
    set({ loading: true });

    try {
      // 順番に処理して確実に更新する
      for (const order of orders) {
        await fetch(`${API_BASE_URL}/api/orders/${order.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "会計済み" }),
        });
      }

      // 更新が終わったら、ローカルの状態をクリア
      set({ orders: [], pendingOrders: [], orderHistory: [], loading: false });
    } catch (error) {
      console.error("Checkout error:", error);
      // エラーでも一旦クリアして進む（スタック防止）
      set({ orders: [], pendingOrders: [], orderHistory: [], loading: false });
    }
  },

  clearPendingOrders: () => set({ orders: [], pendingOrders: [] }),
}));

export const useTotalBillAmount = () =>
  useCartStore((state) => state.orders.reduce((t, o) => t + o.totalAmount, 0));

export const useCartTotalAmount = () =>
  useCartStore((state) => state.cart.reduce((t, i) => t + i.totalPrice, 0));

export const usePendingOrderTotalAmount = useTotalBillAmount;

export default useCartStore;
