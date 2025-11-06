// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
// ★ MenuData を ../types からインポート
import {
  MenuItem,
  CartItem,
  Option,
  Order,
  OrderItem,
  MenuData,
} from "../types";

// APIのベースURL (環境変数から取得するのが望ましい)
const API_BASE_URL = "http://localhost:3000"; // ★ ポートを 3000 に修正

// Zustand ストアの状態の型定義
interface CartState {
  cart: CartItem[]; // 現在のカート内容
  isCartOpen: boolean; // カートサイドバーが開いているか
  pendingOrders: Order[]; // 確定済み・未会計の注文リスト
  menuData: MenuData | null; // ★ 追加: メニューデータ全体を保持 (オプション)
  loading: boolean; // データ読み込み中フラグ
  error: string | null; // エラーメッセージ
}

// Zustand ストアのアクションの型定義
interface CartActions {
  toggleCart: () => void; // カートサイドバーの開閉
  updateCart: (
    menuItem: MenuItem,
    quantity: number,
    selectedOptions?: Option[]
  ) => void;
  removeFromCart: (cartItemId: string) => void; // カートから商品を削除
  clearCart: () => void; // カートを空にする
  placeOrder: (tableNumber: number) => Promise<Order | null>; // 注文を確定する
  fetchOrders: (tableNumber: number) => Promise<void>;
  fetchMenuData: () => Promise<void>; // ★ 追加: メニューデータ全体を取得する (オプション)
  calculateCartTotal: () => number; // カート合計金額を計算
  calculatePendingOrderTotal: () => number; // 未会計注文合計金額を計算
  clearPendingOrders: () => void; // ★ 型定義 (これは前回追加済みのはず)
}

// Zustand ストアの作成
const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // --- 初期状態 ---
      cart: [],
      isCartOpen: false,
      pendingOrders: [],
      menuData: null,
      loading: false,
      error: null,

      // --- アクション ---
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

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

      // ★↓↓↓ clearPendingOrders の実装を追加 ↓↓↓
      clearPendingOrders: () => set({ pendingOrders: [] }),
      // ★↑↑↑ clearPendingOrders の実装を追加 ↑↑↑

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
          set({ loading: true, error: null });
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

          const newOrder: Order = await response.json();

          set((state) => ({
            cart: [],
            isCartOpen: false,
            pendingOrders: [...state.pendingOrders, newOrder],
            loading: false,
          }));
          console.log("Order placed:", newOrder);
          return newOrder;
        } catch (error) {
          console.error("注文処理中にエラーが発生しました:", error);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          set({ error: `注文処理エラー: ${errorMessage}`, loading: false });
          return null;
        }
      },

      fetchOrders: async (tableNumber: number) => {
        // ★ 引数を追加
        // ★ テーブル番号が不正な場合はエラー
        if (!tableNumber) {
          console.warn("fetchOrders: tableNumber がありません。");
          set({
            error: "注文履歴取得エラー: テーブル番号がありません。",
            loading: false,
          });
          return;
        }

        try {
          set({ loading: true, error: null });
          // ★ URL にクエリパラメータ ?tableNumber=... を追加
          const response = await fetch(
            `${API_BASE_URL}/api/orders?tableNumber=${tableNumber}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const orders: Order[] = await response.json();
          set({ pendingOrders: orders, loading: false });
        } catch (
          error: any // ★ any 型に変更
        ) {
          console.error("注文履歴の取得に失敗:", error);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          set({ error: `注文履歴取得エラー: ${errorMessage}`, loading: false });
        }
      },
      fetchMenuData: async () => {
        // ★ 既にデータがあるか、ローディング中なら取得しない
        if (get().menuData || get().loading) {
          return;
        }
        try {
          set({ loading: true, error: null });
          const response = await fetch(`${API_BASE_URL}/api/menu`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: MenuData = await response.json();
          set({ menuData: data, loading: false });
        } catch (e) {
          console.error("メニューデータの取得に失敗しました:", e);
          const errorMessage = e instanceof Error ? e.message : String(e);
          set({
            error: `メニューデータ取得エラー: ${errorMessage}`,
            loading: false,
          });
        }
      },

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
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

export const useCartTotalAmount = () =>
  useCartStore((state) => state.calculateCartTotal());
export const usePendingOrderTotalAmount = () =>
  useCartStore((state) => state.calculatePendingOrderTotal());

export default useCartStore;
