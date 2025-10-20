// src/components/CartSidebar.tsx (修正後)

import React from "react";
import { CartItem, Option } from "../types";

interface CartSidebarProps {
  cart: CartItem[];
  totalAmount: number;
  onUpdateCart: (
    menuItemId: string,
    quantity: number,
    options?: Option[]
  ) => void;
  onPlaceOrder: () => void;
  onGoToPayment: () => void;
  pendingOrderTotalAmount: number;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  totalAmount,
  onUpdateCart,
  onPlaceOrder,
  onGoToPayment,
  pendingOrderTotalAmount,
}) => {
  const handleUpdateQuantity = (item: CartItem, change: number) => {
    onUpdateCart(item.menuItemId, item.quantity + change, item.selectedOptions);
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
                ¥{(item.price * item.quantity).toLocaleString()}
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
