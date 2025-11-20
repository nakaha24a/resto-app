import { create } from "zustand";
import {
  CartItem,
  MenuItem,
  Option,
  Order,
  MenuData,
  OrderItem,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

interface CartState {
  cart: CartItem[];
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
  // ★ 修正: 引数を number に
  placeOrder: (tableNum: number) => Promise<Order | null>;
  fetchOrders: (tableNum: number) => Promise<void>;
  callStaff: (tableNum: number) => Promise<boolean>;
  clearPendingOrders: () => void;
}

const useCartStore = create<CartState>((set, get) => ({
  cart: [],
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
      // (既存のカート追加ロジック - 変更なし)
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

  // ★ 修正: number 引数
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
          tableNumber: tableNum, // 数値を送信
          items: orderDetails,
        }),
      });

      if (!response.ok) throw new Error("注文失敗");

      const newOrderResponse = await response.json();
      const newOrder: Order = {
        id: newOrderResponse.id.toString(),
        tableNum: Number(newOrderResponse.table_number), // 数値として受け取る
        items: newOrderResponse.items,
        totalAmount: newOrderResponse.total_price,
        timestamp: newOrderResponse.timestamp,
        status: newOrderResponse.status,
      };

      set((state) => ({
        pendingOrders: [...state.pendingOrders, newOrder],
        cart: [],
        loading: false,
      }));
      return newOrder;
    } catch (err) {
      set({ error: "注文送信エラー", loading: false });
      return null;
    }
  },

  // ★ 修正: number 引数
  fetchOrders: async (tableNum: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders?tableNumber=${tableNum}`
      );
      if (!response.ok) throw new Error("履歴取得失敗");
      const ordersResponse: any[] = await response.json();

      const mappedOrders: Order[] = ordersResponse.map((order) => ({
        id: order.id.toString(),
        tableNum: Number(order.table_number), // 数値変換
        items: JSON.parse(order.items || "[]"),
        totalAmount: order.total_price,
        timestamp: order.timestamp,
        status: order.status,
      }));

      // "注文受付" も pending に含める
      const pending = mappedOrders.filter(
        (o) => o.status === "調理中" || o.status === "注文受付"
      );
      const history = mappedOrders.filter(
        (o) => o.status !== "調理中" && o.status !== "注文受付"
      );

      set({ pendingOrders: pending, orderHistory: history, loading: false });
    } catch (err) {
      set({ error: "履歴エラー", loading: false });
    }
  },

  // ★ 修正: number 引数
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

  clearPendingOrders: () => set({ pendingOrders: [] }),
}));

export const useCartTotalAmount = () =>
  useCartStore((state) => state.cart.reduce((t, i) => t + i.totalPrice, 0));

export const usePendingOrderTotalAmount = () =>
  useCartStore((state) =>
    state.pendingOrders.reduce((t, o) => t + o.totalAmount, 0)
  );

export default useCartStore;
