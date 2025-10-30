// src/components/CartSidebar.tsx

import React from "react";
// ★ MenuItem, Option, CartItem をインポート
import { MenuItem, Option, CartItem } from "../types";
// ★ ストアのフックと updateCart アクションをインポート
import useCartStore from "../store/cartStore";

interface CartSidebarProps {
  cart: CartItem[];
  totalAmount: number;
  // ★ onUpdateCart プロパティは削除 (ストアのアクションを直接使うため)
  // onUpdateCart: (menuItem: MenuItem, quantity: number, selectedOptions?: Option[]) => void;
  onPlaceOrder: () => void;
  onGoToPayment: () => void;
  pendingOrderTotalAmount: number;
}

// ★ MenuItem を非同期で取得するヘルパー関数 (仮実装、実際にはAPIやストアから取得)
//    cartStore に menuData があればそこから探すのが現実的
async function findMenuItemById(id: string): Promise<MenuItem | null> {
  const menuData = useCartStore.getState().menuData; // ストアから取得 (レンダリング外でのgetStateは注意)
  if (!menuData) {
    // メニューデータがなければ fetchMenuData を呼ぶ (これもレンダリング外なので注意)
    await useCartStore.getState().fetchMenuData();
    const updatedMenuData = useCartStore.getState().menuData;
    if (!updatedMenuData) return null; // それでもなければ諦める

    for (const category of updatedMenuData.categories) {
      const found = category.items.find((item) => item.id === id);
      if (found) return found;
    }
  } else {
    for (const category of menuData.categories) {
      const found = category.items.find((item) => item.id === id);
      if (found) return found;
    }
  }
  console.error(`MenuItem with id ${id} not found in store.`);
  return null; // 見つからなかった場合
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  totalAmount,
  // onUpdateCart, // ← 削除
  onPlaceOrder,
  onGoToPayment,
  pendingOrderTotalAmount,
}) => {
  // ★ ストアから updateCart アクションを取得
  const updateCartAction = useCartStore((state) => state.updateCart);

  const handleUpdateQuantity = async (cartItem: CartItem, change: number) => {
    const newQuantity = cartItem.quantity + change;

    // ★ CartItem の情報から MenuItem を検索 (非同期になる可能性)
    const menuItem = await findMenuItemById(cartItem.menuItemId);

    if (menuItem) {
      // ★ ストアのアクションを直接呼び出す
      updateCartAction(menuItem, newQuantity, cartItem.selectedOptions);
    } else {
      // MenuItem が見つからなかった場合のエラー処理
      console.error(
        "カート更新エラー: 元の商品情報が見つかりません。",
        cartItem
      );
      alert("カートの更新中にエラーが発生しました。");
    }
  };

  return (
    <div className="order-sidebar">
      <h2 className="sidebar-title">🛒 現在の注文</h2>
      {cart.length === 0 ? (
        <p className="empty-cart-message">商品が選択されていません。</p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.id} className="cart-item">
              <div className="cart-item-info">
                <span className="item-name">{item.name}</span>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <span className="item-options">
                    {item.selectedOptions.map((o: Option) => o.name).join(", ")}
                  </span>
                )}
              </div>
              <div className="item-control">
                <button
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item, -1)}
                >
                  −
                </button>
                <span className="item-quantity">{item.quantity}</span>
                <button
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item, 1)}
                >
                  ＋
                </button>
              </div>
              <span className="item-price">
                ¥
                {(
                  (item.price +
                    (item.selectedOptions?.reduce(
                      (sum, opt) => sum + opt.price,
                      0
                    ) || 0)) *
                  item.quantity
                ).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="cart-summary">
        <div className="summary-row">
          <span>合計 (税込)</span>
          <span className="summary-amount">
            ¥{totalAmount.toLocaleString()}
          </span>
        </div>
        <button
          className="order-confirm-button"
          onClick={onPlaceOrder}
          disabled={cart.length === 0}
        >
          この内容で注文を確定する
        </button>
        <button
          className="goto-payment-btn"
          onClick={onGoToPayment}
          disabled={pendingOrderTotalAmount === 0 && cart.length === 0}
        >
          お会計に進む 💳
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;
