// src/store/cartStore.ts (エラー修正・完成版)

import { create } from "zustand";
import { CartItem, Order, OrderItem, Option, MenuItem } from "../types";
import { StateCreator } from "zustand"; // ★ set, getに型を付けるためにインポート

// ★★★ エラーの根本原因 ★★★
// StoreState の型定義が消えていたので復活させます
interface StoreState {
  cart: CartItem[];
  pendingOrders: Order[];
  cartTotalAmount: number;
  pendingOrderTotalAmount: number;
  menuItems: MenuItem[];
}

// ストアが持つアクション（状態を変更する関数）の型
interface StoreActions {
  updateCart: (
    menuItemId: string,
    quantity: number,
    selectedOptions?: Option[]
  ) => void;
  placeOrder: (tableNumber: string) => Promise<Order | null>;
  clearCart: () => void;
  clearPendingOrders: () => void;
  fetchMenuItems: () => Promise<void>;
}

// ★ set, get に型を付けるための型定義
type AppState = StoreState & StoreActions;

// ★ create<AppState>() の中の (set, get) に型を明示的に指定します
const storeCreator: StateCreator<AppState> = (set, get) => ({
  // =============================
  // 初期状態 (State)
  // =============================
  cart: [],
  pendingOrders: [],
  cartTotalAmount: 0,
  pendingOrderTotalAmount: 0,
  menuItems: [], // ============================= // アクション (Actions) // =============================

  fetchMenuItems: async () => {
    try {
      const response = await fetch("http://localhost:3000/api/menu");
      if (!response.ok) {
        throw new Error("メニューの取得に失敗しました");
      }
      const data: MenuItem[] = await response.json();
      set({ menuItems: data });
    } catch (error) {
      console.error("メニューのフェッチに失敗:", error);
    }
  },

  // ★ 'any' エラーを修正
  updateCart: (
    menuItemId: string,
    quantity: number,
    selectedOptions: Option[] = [] // 型を明示
  ) => {
    const menuItem = get().menuItems.find((m: MenuItem) => m.id === menuItemId); // ★ 'm' に型
    if (!menuItem) return;

    const optionsId = selectedOptions
      .map((opt: Option) => opt.name) // ★ 'opt' に型
      .sort()
      .join("-");
    const cartItemId = `${menuItemId}-${optionsId}`;

    let newCart = [...get().cart];
    const existingItemIndex = newCart.findIndex(
      (item: CartItem) => item.id === cartItemId // ★ 'item' に型
    );

    if (quantity <= 0) {
      if (existingItemIndex > -1) newCart.splice(existingItemIndex, 1);
    } else if (existingItemIndex > -1) {
      newCart[existingItemIndex] = { ...newCart[existingItemIndex], quantity };
    } else {
      const optionsPrice = selectedOptions.reduce(
        (total: number, opt: Option) => total + opt.price, // ★ 'total', 'opt' に型
        0
      );
      newCart.push({
        id: cartItemId,
        menuItemId,
        name: menuItem.name,
        price: menuItem.price + optionsPrice,
        quantity,
        selectedOptions,
      });
    }

    const newTotal = newCart.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity, // ★ 'total', 'item' に型
      0
    );
    set({ cart: newCart, cartTotalAmount: newTotal });
  },

  // ★ 'any' エラーを修正
  placeOrder: async (tableNumber: string) => {
    const { cart, cartTotalAmount, menuItems } = get();
    if (cart.length === 0) {
      alert("カートに商品がありません。");
      return null;
    }

    const itemsPayload = cart.map((cartItem: CartItem) => ({
      // ★ 'cartItem' に型
      id: cartItem.menuItemId,
      quantity: cartItem.quantity,
    }));

    try {
      const response = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_number: tableNumber,
          items: itemsPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("注文の送信に失敗しました");
      }

      const result = await response.json();
      console.log("バックエンドへの注文送信成功:", result);

      const orderItems: OrderItem[] = cart.map((cartItem: CartItem) => {
        // ★ 'cartItem' に型
        const menuItem = menuItems.find(
          (m: MenuItem) => m.id === cartItem.menuItemId
        )!; // ★ 'm' に型
        return {
          ...menuItem,
          price: cartItem.price,
          quantity: cartItem.quantity,
          selectedOptions: cartItem.selectedOptions,
        };
      });

      const newOrder: Order = {
        id: `be-${result.orderId}`,
        tableNumber,
        items: orderItems,
        totalAmount: cartTotalAmount,
        timestamp: Date.now(),
      };

      set((state: StoreState) => ({
        // ★ 'state' に型
        pendingOrders: [...state.pendingOrders, newOrder],
        pendingOrderTotalAmount:
          state.pendingOrderTotalAmount + cartTotalAmount,
        cart: [],
        cartTotalAmount: 0,
      }));
      return newOrder;
    } catch (error) {
      console.error("注文の送信中にエラーが発生:", error);
      alert("注文の送信に失敗しました。もう一度お試しください。");
      return null;
    }
  },

  clearCart: () => set({ cart: [], cartTotalAmount: 0 }),
  clearPendingOrders: () =>
    set({ pendingOrders: [], pendingOrderTotalAmount: 0 }),
});

const useCartStore = create(storeCreator); // ★ create<AppState>() から変更

export default useCartStore;
