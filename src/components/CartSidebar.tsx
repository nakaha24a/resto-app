// src/components/CartSidebar.tsx

import React from "react";
// ★ MenuItem, Option, CartItem をインポート
import { MenuItem, Option, CartItem } from "../types";
// ★ ストアのフックと updateCart アクションをインポート
import useCartStore from "../store/cartStore";
// ★ ストアから menuData を取得するためにインポート
import { Category } from "../types"; // (または MenuData)

interface CartSidebarProps {
  cart: CartItem[];
  totalAmount: number;
  // ★ onUpdateCart プロパティは削除 (ストアのアクションを直接使うため)
  // onUpdateCart: (menuItem: MenuItem, quantity: number, selectedOptions?: Option[]) => void;
  onPlaceOrder: () => void;
  onGoToPayment: () => void;
  pendingOrderTotalAmount: number;
}

// ★ カートアイテムから MenuItem をストア内で検索するヘルパー関数
// (ストアの menuData がロードされている前提)
async function findMenuItemById(id: string): Promise<MenuItem | null> {
  let menuData = useCartStore.getState().menuData;
  // もしストアに menuData がなければ取得を試みる
  if (!menuData) {
    await useCartStore.getState().fetchMenuData();
    menuData = useCartStore.getState().menuData;
  }

  if (menuData && Array.isArray(menuData.categories)) {
    for (const category of menuData.categories) {
      // ★ Category 型の items が配列であることを確認
      if (category.items && Array.isArray(category.items)) {
        const found = category.items.find((item) => item.id === id);
        if (found) return found;
      }
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

    // ★ CartItem の情報から MenuItem を検索 (非同期)
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
      // ★ ユーザーにエラーを通知
      alert("カートの更新中にエラーが発生しました。");
    }
  };

  // ★ オプション込みの価格を計算するヘルパー
  const calculateItemTotal = (item: CartItem) => {
    const optionsTotal =
      item.selectedOptions?.reduce((sum, option) => sum + option.price, 0) || 0;
    return (item.price + optionsTotal) * item.quantity;
  };

  return (
    // ★ クラス名を order-sidebar に変更 (CSSに合わせる)
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
                    {/* ★ Option 型を明示 */}
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
                {/* ★ オプション込みの合計金額を表示 */}¥
                {calculateItemTotal(item).toLocaleString()}
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
          // ★ カートが空でも未会計があれば支払いに行けるように修正
          disabled={pendingOrderTotalAmount === 0 && cart.length === 0}
        >
          お会計に進む 💳
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;
