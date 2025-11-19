import { create } from "zustand";
import {
  CartItem,
  MenuItem,
  Option,
  Order,
  MenuData,
  Category,
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
  placeOrder: (tableNum: string) => Promise<Order | null>;
  fetchOrders: (tableNum: string) => Promise<void>;
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MenuData = await response.json();
      if (!data.categories || data.categories.length === 0) {
        console.warn("メニューデータにカテゴリが含まれていません。");
      }
      set({ menuData: data, menuLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "メニューの読み込みに失敗しました。";
      console.error("fetchMenuData error:", errorMsg);
      set({ error: errorMsg, menuLoading: false });
    }
  },

  updateCart: (item, quantity, selectedOptions) =>
    set((state) => {
      const optionsKey = selectedOptions
        .map((opt) => opt.name) // Option型は name のみ
        .sort()
        .join("-");
      const uniqueId = `${item.id}_${optionsKey || "default"}`;

      const existingItemIndex = state.cart.findIndex(
        (cartItem) => cartItem.uniqueId === uniqueId
      );

      let newCart = [...state.cart];
      const optionsTotalPrice = selectedOptions.reduce(
        (total, opt) => total + (opt.price || 0),
        0
      );

      if (existingItemIndex > -1) {
        const newQuantity = newCart[existingItemIndex].quantity + quantity;
        if (newQuantity <= 0) {
          newCart.splice(existingItemIndex, 1);
        } else {
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newQuantity,
            totalPrice: (item.price + optionsTotalPrice) * newQuantity,
          };
        }
      } else if (quantity > 0) {
        newCart.push({
          ...item,
          uniqueId: uniqueId,
          quantity: quantity,
          selectedOptions: selectedOptions,
          totalPrice: (item.price + optionsTotalPrice) * quantity,
        });
      }
      return { cart: newCart };
    }),

  removeFromCart: (uniqueId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.uniqueId !== uniqueId),
    })),

  clearCart: () => set({ cart: [] }),

  placeOrder: async (tableNum: string) => {
    const { cart } = get();
    if (cart.length === 0) {
      set({ error: "カートが空です。" });
      return null;
    }
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
          tableNumber: tableNum, // 文字列のまま送信
          items: orderDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "注文処理に失敗しました。");
      }

      const newOrderResponse = await response.json();
      const newOrder: Order = {
        id: newOrderResponse.id.toString(),
        tableNum: newOrderResponse.table_number.toString(), // 文字列として扱う
        items: newOrderResponse.items, // server.js は items オブジェクトを返す
        totalAmount: newOrderResponse.total_price,
        timestamp: newOrderResponse.timestamp,
        status: newOrderResponse.status, // "注文受付" が返ってくる
      };

      set((state) => ({
        pendingOrders: [...state.pendingOrders, newOrder],
        cart: [],
        loading: false,
      }));
      return newOrder;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "注文の送信に失敗しました。";
      console.error("placeOrder error:", errorMsg);
      set({ error: errorMsg, loading: false });
      return null;
    }
  },

  fetchOrders: async (tableNum: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders?tableNumber=${encodeURIComponent(tableNum)}`
      );
      if (!response.ok) {
        throw new Error("注文履歴の取得に失敗しました。");
      }

      const ordersResponse: any[] = await response.json();

      const mappedOrders: Order[] = ordersResponse.map((order) => ({
        id: order.id.toString(),
        tableNum: order.table_number.toString(), // 文字列として扱う
        items: JSON.parse(order.items || "[]"), // server.js は items を JSON 文字列で返す
        totalAmount: order.total_price,
        timestamp: order.timestamp,
        status: order.status, // "注文受付" など
      }));

      // ★ 修正: "注文受付" も "調理中" と同じく pending（まだ料理が来ていない状態）に含める
      const pending = mappedOrders.filter(
        (order) => order.status === "調理中" || order.status === "注文受付"
      );
      // それ以外（提供済み、会計済みなど）を履歴とする
      const history = mappedOrders.filter(
        (order) => order.status !== "調理中" && order.status !== "注文受付"
      );

      set({ pendingOrders: pending, orderHistory: history, loading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "注文履歴の取得に失敗しました。";
      console.error("fetchOrders error:", errorMsg);
      set({ error: errorMsg, loading: false });
    }
  },

  clearPendingOrders: () => set({ pendingOrders: [] }),
}));

export const useCartTotalAmount = () =>
  useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.totalPrice, 0)
  );

export const usePendingOrderTotalAmount = () =>
  useCartStore((state) =>
    state.pendingOrders.reduce((total, order) => total + order.totalAmount, 0)
  );

export default useCartStore;
