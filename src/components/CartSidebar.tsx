import React, { useState } from "react";
import useCartStore, {
  useCartTotalAmount,
  usePendingOrderTotalAmount,
} from "../store/cartStore";
import { CartItem, MenuItem, Option } from "../types"; // ★ Option をインポート

interface CartSidebarProps {
  cart: CartItem[];
  totalAmount: number;
  onPlaceOrder: () => void;
  onGoToPayment: () => void;
  pendingOrderTotalAmount: number;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  totalAmount,
  onPlaceOrder,
  onGoToPayment,
  pendingOrderTotalAmount,
}) => {
  const { updateCart } = useCartStore(); // ★ menuData は不要

  // ★ 修正:
  // CartItem は MenuItem を継承しており、findMenuItemById は不要。
  // cartItem 自体を updateCart に渡す。
  // (TS2339: 'menuItemId' エラーの解消)
  const handleUpdateQuantity = (cartItem: CartItem, newQuantity: number) => {
    // 差分の数量を計算してストアを更新
    const quantityDifference = newQuantity - cartItem.quantity;
    updateCart(cartItem, quantityDifference, cartItem.selectedOptions);
  };

  // ★ 修正: selectedOptions の型を Option[] に指定
  const getOptionsText = (options: Option[]) => {
    if (!options || options.length === 0) return "";
    return options.map((opt) => `+ ${opt.name}`).join(", ");
  };

  const totalPaymentAmount = totalAmount + pendingOrderTotalAmount;
  const canPlaceOrder = cart.length > 0;
  const canGoToPayment = totalPaymentAmount > 0;

  return (
    <aside className="order-sidebar">
      <h2 className="sidebar-title">🛒 現在の注文</h2>

      {cart.length === 0 ? (
        <p className="empty-cart-message">商品が選択されていません。</p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.uniqueId} className="cart-item">
              <div className="cart-item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-options">
                  {getOptionsText(item.selectedOptions)}
                </span>
              </div>
              <div className="item-control">
                <button
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                >
                  -
                </button>
                <span className="item-quantity">{item.quantity}</span>
                <button
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <span className="item-price">
                ¥{item.totalPrice.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-summary">
        {pendingOrderTotalAmount > 0 && (
          <div className="summary-row">
            <span>提供待ちの合計</span>
            <span className="summary-amount">
              ¥{pendingOrderTotalAmount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="summary-row">
          <span>
            {pendingOrderTotalAmount > 0 ? "お会計合計" : "合計 (税込)"}
          </span>
          <span className="summary-amount">
            ¥{totalPaymentAmount.toLocaleString()}
          </span>
        </div>
        <button
          className="order-confirm-button"
          onClick={onPlaceOrder}
          disabled={!canPlaceOrder}
        >
          {totalAmount > 0
            ? `(¥${totalAmount.toLocaleString()}) の注文を確定する`
            : "注文を確定する"}
        </button>
        <button
          className="goto-payment-btn"
          onClick={onGoToPayment}
          disabled={!canGoToPayment}
        >
          お会計に進む 💳
        </button>
      </div>
    </aside>
  );
};

export default CartSidebar;
