import { create } from "zustand";
import {
  CartItem,
  MenuItem,
  Option,
  Order,
  MenuData,
  Category,
  OrderItem, // ★ 修正: OrderItem をインポート
} from "../types";

// 環境変数から API_BASE_URL を読み込む (修正済み)
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
  placeOrder: (tableNum: number) => Promise<Order | null>;
  fetchOrders: (tableNum: number) => Promise<void>;
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
    if (get().menuData) return; // 既にデータがあれば取得しない
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
      // ★ 修正: Option に id がないため、name を使ってキーを生成
      const optionsKey = selectedOptions
        .map((opt) => opt.name) // opt.id から opt.name に変更
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
      const itemTotalPrice = (item.price + optionsTotalPrice) * quantity;

      if (existingItemIndex > -1) {
        // 既存アイテムの数量を更新
        const newQuantity = newCart[existingItemIndex].quantity + quantity;

        if (newQuantity <= 0) {
          // 数量が0以下ならカートから削除
          newCart.splice(existingItemIndex, 1);
        } else {
          // 数量と合計金額を更新
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newQuantity,
            // ★ 修正: totalPrice も更新
            totalPrice: (item.price + optionsTotalPrice) * newQuantity,
          };
        }
      } else if (quantity > 0) {
        // 新規アイテムとしてカートに追加 (★ 修正: 型定義に合わせて全プロパティを設定)
        newCart.push({
          ...item, // MenuItem のプロパティ (id, name, price, image...) を継承
          uniqueId: uniqueId,
          quantity: quantity,
          selectedOptions: selectedOptions,
          totalPrice: itemTotalPrice, // (単価 + オプション価格) * 数量
        });
      }

      return { cart: newCart };
    }),

  removeFromCart: (uniqueId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.uniqueId !== uniqueId),
    })),

  clearCart: () => set({ cart: [] }),

  placeOrder: async (tableNum) => {
    const { cart } = get();
    if (cart.length === 0) {
      set({ error: "カートが空です。" });
      return null;
    }
    set({ loading: true, error: null });
    try {
      // ★ 修正: 型を OrderItem[] に指定 (types/index.ts と一致)
      const orderDetails: OrderItem[] = cart.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price, // 単価
        options: item.selectedOptions, // types/index.ts の OrderItem に合わせる
        totalPrice: item.totalPrice, // types/index.ts の OrderItem に合わせる
      }));

      // ★ 修正: totalPrice を使って合計金額を計算
      const totalAmount = orderDetails.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ★ 修正: types/index.ts の Order 型に一致させる
        body: JSON.stringify({
          tableNum: tableNum,
          items: orderDetails,
          totalAmount: totalAmount,
          status: "PENDING",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "注文処理に失敗しました。");
      }

      const newOrder: Order = await response.json();

      set((state) => ({
        pendingOrders: [...state.pendingOrders, newOrder],
        cart: [], // カートを空にする
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

  fetchOrders: async (tableNum) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/table/${tableNum}`
      );
      if (!response.ok) {
        throw new Error("注文履歴の取得に失敗しました。");
      }
      const orders: Order[] = await response.json();
      const pending = orders.filter((order) => order.status === "PENDING");
      const history = orders.filter((order) => order.status !== "PENDING");
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

// ★ 修正: item.totalPrice を参照
export const useCartTotalAmount = () =>
  useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.totalPrice, 0)
  );

// ★ 修正: order.totalAmount を参照
export const usePendingOrderTotalAmount = () =>
  useCartStore((state) =>
    state.pendingOrders.reduce((total, order) => total + order.totalAmount, 0)
  );

export default useCartStore;
