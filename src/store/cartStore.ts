// src/store/cartStore.ts
// ★ 修正版: loading 状態を分離し、履歴重複バグを修正

import { create } from "zustand";
// ★ 修正: createJSONStorage を正しくインポート
import { persist, createJSONStorage } from "zustand/middleware";
import {
  MenuItem,
  CartItem,
  Option,
  Order,
  OrderItem,
  MenuData,
} from "../types";

const API_BASE_URL = "http://localhost:3000";

// Zustand ストアの状態の型定義
interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  pendingOrders: Order[];
  menuData: MenuData | null; // ★ 修正: loading を2つに分離
  menuLoading: boolean;
  orderLoading: boolean;
  error: string | null;
}

// Zustand ストアのアクションの型定義
interface CartActions {
  toggleCart: () => void;
  updateCart: (
    menuItem: MenuItem,
    quantity: number,
    selectedOptions?: Option[]
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  placeOrder: (tableNumber: number) => Promise<Order | null>;
  fetchOrders: (tableNumber: number) => Promise<void>;
  fetchMenuData: () => Promise<void>;
  calculateCartTotal: () => number;
  calculatePendingOrderTotal: () => number;
  clearPendingOrders: () => void;
}

const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // --- 初期状態 ---
      cart: [],
      isCartOpen: false,
      pendingOrders: [],
      menuData: null, // ★ 修正: loading を2つに分離
      menuLoading: false,
      orderLoading: false,
      error: null, // --- アクション ---

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })), // (中略: updateCart, removeFromCart, clearCart は変更なし)

      updateCart: (menuItem, quantity, selectedOptions = []) => {
        set((state) => {
          const optionsId = selectedOptions
            .map((opt) => opt.name)
            .sort()
            .join("-");
          const cartItemId = `${menuItem.id}-${optionsId || "no-options"}`;
          const existingItemIndex = state.cart.findIndex(
            (item) => item.id === cartItemId
          );

          let newCart = [...state.cart];

          if (quantity <= 0) {
            if (existingItemIndex > -1) {
              newCart.splice(existingItemIndex, 1);
            }
          } else if (existingItemIndex > -1) {
            newCart[existingItemIndex] = {
              ...newCart[existingItemIndex],
              quantity: quantity,
            };
          } else {
            const newItem: CartItem = {
              id: cartItemId,
              menuItemId: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              quantity: quantity,
              selectedOptions: selectedOptions,
            };
            newCart.push(newItem);
          }
          return { cart: newCart };
        });
      },
      removeFromCart: (cartItemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== cartItemId),
        }));
      },
      clearCart: () => set({ cart: [] }),
      clearPendingOrders: () => set({ pendingOrders: [] }), // (中略ここまで)
      placeOrder: async (tableNumber) => {
        const cartItems = get().cart;
        if (cartItems.length === 0) {
          console.warn("カートが空です");
          return null;
        }

        const orderData = {
          tableNumber: tableNumber,
          items: cartItems.map((item) => ({
            id: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions || [],
          })),
        };

        try {
          // ★ 修正: orderLoading を true に
          set({ orderLoading: true, error: null });
          const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            let errorBody = "サーバーエラーが発生しました";
            try {
              const errorJson = await response.json();
              errorBody = errorJson.error || JSON.stringify(errorJson);
            } catch (_) {
              errorBody = await response.text();
            }
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${errorBody}`
            );
          }

          const newOrder: Order = await response.json(); // ★ 修正: orderLoading を false に

          set({
            cart: [],
            isCartOpen: false,
            orderLoading: false,
          }); // ★ 修正: 注文成功後、履歴を再取得

          await get().fetchOrders(tableNumber);

          console.log("Order placed and history refetched:", newOrder);
          return newOrder;
        } catch (error) {
          console.error("注文処理中にエラーが発生しました:", error);
          const errorMessage =
            error instanceof Error ? error.message : String(error); // ★ 修正: orderLoading を false に
          set({
            error: `注文処理エラー: ${errorMessage}`,
            orderLoading: false,
          });
          return null;
        }
      },

      fetchOrders: async (tableNumber: number) => {
        if (!tableNumber) {
          console.warn("fetchOrders: tableNumber がありません。");
          set({
            error: "注文履歴取得エラー: テーブル番号がありません。",
            orderLoading: false, // ★ 修正: orderLoading
          });
          return;
        }

        try {
          // ★ 修正: orderLoading を true に
          set({ orderLoading: true, error: null });
          const response = await fetch(
            `${API_BASE_URL}/api/orders?tableNumber=${tableNumber}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const orders: Order[] = await response.json(); // ★ 修正: orderLoading を false に (上書きロジックは正しい)
          set({ pendingOrders: orders, orderLoading: false });
        } catch (error: any) {
          console.error("注文履歴の取得に失敗:", error);
          const errorMessage =
            error instanceof Error ? error.message : String(error); // ★ 修正: orderLoading を false に
          set({
            error: `注文履歴取得エラー: ${errorMessage}`,
            orderLoading: false,
          });
        }
      },

      fetchMenuData: async () => {
        // ★ 修正: 既にデータがある場合のみ return
        if (get().menuData) {
          return;
        }
        try {
          // ★ 修正: menuLoading を true に
          set({ menuLoading: true, error: null });
          const response = await fetch(`${API_BASE_URL}/api/menu`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: MenuData = await response.json(); // ★ 修正: menuLoading を false に
          set({ menuData: data, menuLoading: false });
        } catch (e) {
          console.error("メニューデータの取得に失敗しました:", e);
          const errorMessage = e instanceof Error ? e.message : String(e); // ★ 修正: menuLoading を false に
          set({
            error: `メニューデータ取得エラー: ${errorMessage}`,
            menuLoading: false,
          });
        }
      }, // (中略: calculateCartTotal, calculatePendingOrderTotal は変更なし)

      calculateCartTotal: () => {
        return get().cart.reduce((total, item) => {
          const optionsTotal =
            item.selectedOptions?.reduce(
              (sum, option) => sum + option.price,
              0
            ) || 0;
          return total + (item.price + optionsTotal) * item.quantity;
        }, 0);
      },
      calculatePendingOrderTotal: () => {
        return get().pendingOrders.reduce((total, order) => {
          return total + (order.total_price || 0);
        }, 0);
      }, // (中略ここまで)
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage), // ★ インポートエラー修正 // ★ 修正: 履歴(pendingOrders)やローディング状態は保存しない
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

// (中略: export は変更なし)
export const useCartTotalAmount = () =>
  useCartStore((state) => state.calculateCartTotal());
export const usePendingOrderTotalAmount = () =>
  useCartStore((state) => state.calculatePendingOrderTotal());
// (中略ここまで)

export default useCartStore;
