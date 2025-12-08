import React from "react";
import useCartStore, {
  useCartTotalAmount,
  usePendingOrderTotalAmount,
} from "../store/cartStore";
import { CartItem } from "../types";

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
  const { removeFromCart, updateCart } = useCartStore();

  const handleIncrease = (item: CartItem) => {
    updateCart(item, 1, item.selectedOptions);
  };

  const handleDecrease = (item: CartItem) => {
    updateCart(item, -1, item.selectedOptions);
  };

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h2 className="cart-title">現在の注文</h2>
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart-container">
            <p className="empty-cart-message">カートは空です</p>
            <p className="empty-cart-sub">メニューを選んでください</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.uniqueId} className="cart-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                {item.selectedOptions.length > 0 && (
                  <span className="item-options">
                    {item.selectedOptions.map((o) => o.name).join(", ")}
                  </span>
                )}
                <span className="item-price">
                  ¥{item.totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="item-controls">
                <button
                  className="quantity-btn"
                  onClick={() => handleDecrease(item)}
                >
                  -
                </button>
                <span className="item-quantity">{item.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleIncrease(item)}
                >
                  +
                </button>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.uniqueId)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        {cart.length > 0 && (
          <div className="cart-summary-area">
            <div className="cart-total">
              <span className="total-label">合計</span>
              <span className="total-price">
                ¥{totalAmount.toLocaleString()}
              </span>
            </div>
            <button className="place-order-btn" onClick={onPlaceOrder}>
              注文を確定する
            </button>
          </div>
        )}

        {/* 注文履歴・会計ボタンへの導線 */}
        {pendingOrderTotalAmount > 0 && (
          <div className="payment-link-area">
            <div className="pending-amount-info">
              <span>未会計分:</span>
              <strong>¥{pendingOrderTotalAmount.toLocaleString()}</strong>
            </div>
            <button className="payment-nav-btn" onClick={onGoToPayment}>
              会計 / 履歴へ進む
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
