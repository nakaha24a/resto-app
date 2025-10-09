// src/store/cartStore.ts (修正・完成版)

import { create } from "zustand"; // ★ import方法を修正
import { CartItem, Order, OrderItem, Option, MenuItem } from "../types";
import { MOCK_MENU } from "../data/menu";

// ストアが持つ状態（データ）の型
interface StoreState {
  cart: CartItem[];
  pendingOrders: Order[];
  cartTotalAmount: number;
  pendingOrderTotalAmount: number;
  menuItems: MenuItem[]; // メニューリストもストアで管理
}

// ストアが持つアクション（状態を変更する関数）の型
interface StoreActions {
  updateCart: (
    menuItemId: string,
    quantity: number,
    selectedOptions?: Option[]
  ) => void;
  placeOrder: (tableNumber: string) => Order | null;
  clearCart: () => void;
  clearPendingOrders: () => void;
}

// ストアを作成
const useCartStore = create<StoreState & StoreActions>((set, get) => ({
  // =============================
  // 初期状態 (State)
  // =============================
  cart: [],
  pendingOrders: [],
  cartTotalAmount: 0,
  pendingOrderTotalAmount: 0,
  menuItems: MOCK_MENU, // ★ 初期メニューをセット

  // =============================
  // アクション (Actions)
  // =============================
  updateCart: (menuItemId, quantity, selectedOptions = []) => {
    const menuItem = get().menuItems.find((m) => m.id === menuItemId);
    if (!menuItem) return;

    const optionsId = selectedOptions
      .map((opt: Option) => opt.name)
      .sort()
      .join("-");
    const cartItemId = `${menuItemId}-${optionsId}`;

    let newCart = [...get().cart];
    const existingItemIndex = newCart.findIndex(
      (item) => item.id === cartItemId
    );

    if (quantity <= 0) {
      if (existingItemIndex > -1) newCart.splice(existingItemIndex, 1);
    } else if (existingItemIndex > -1) {
      newCart[existingItemIndex] = { ...newCart[existingItemIndex], quantity };
    } else {
      const optionsPrice = selectedOptions.reduce(
        (total, opt) => total + opt.price,
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
      (total, item) => total + item.price * item.quantity,
      0
    );
    set({ cart: newCart, cartTotalAmount: newTotal });
  },

  placeOrder: (tableNumber) => {
    const { cart, cartTotalAmount, menuItems } = get();
    if (cart.length === 0) {
      alert("カートに商品がありません。");
      return null;
    }

    const orderItems: OrderItem[] = cart.map((cartItem: CartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId)!;
      return {
        ...menuItem,
        price: cartItem.price,
        quantity: cartItem.quantity,
        selectedOptions: cartItem.selectedOptions,
      };
    });

    const newOrder: Order = {
      id: `O${Date.now()}`,
      tableNumber,
      items: orderItems,
      totalAmount: cartTotalAmount,
      timestamp: Date.now(),
    };

    set((state) => ({
      pendingOrders: [...state.pendingOrders, newOrder],
      pendingOrderTotalAmount: state.pendingOrderTotalAmount + cartTotalAmount,
      cart: [],
      cartTotalAmount: 0,
    }));
    return newOrder;
  },

  clearCart: () => set({ cart: [], cartTotalAmount: 0 }),
  clearPendingOrders: () =>
    set({ pendingOrders: [], pendingOrderTotalAmount: 0 }),
}));

export default useCartStore;
