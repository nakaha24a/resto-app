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
        <span
          style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "bold" }}
        >
          {cart.reduce((sum, i) => sum + i.quantity, 0)}点
        </span>
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart-container">
            <div className="empty-cart-icon">🍽️</div>
            <p className="empty-cart-message">カートは空です</p>
            <p className="empty-cart-sub">
              左側のメニューから
              <br />
              商品を選んでください
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.uniqueId} className="cart-item">
              <div className="item-info-row">
                <div style={{ flex: 1 }}>
                  <span className="item-name">{item.name}</span>
                  {item.selectedOptions.length > 0 && (
                    <div className="item-options">
                      {item.selectedOptions.map((o) => o.name).join(", ")}
                    </div>
                  )}
                </div>
                <span className="item-price">
                  ¥{item.totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="item-controls-row">
                <button
                  className="remove-link"
                  onClick={() => removeFromCart(item.uniqueId)}
                >
                  削除
                </button>
                <div className="quantity-adjuster">
                  <button
                    className="qty-btn"
                    onClick={() => handleDecrease(item)}
                  >
                    −
                  </button>
                  <span className="item-qty-val">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => handleIncrease(item)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        {cart.length > 0 && (
          <div className="cart-summary-area">
            <div className="cart-total-row">
              <span className="total-label">合計 (税込)</span>
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
            <div className="pending-info">
              <span>お会計待ち金額:</span>
              <strong>¥{pendingOrderTotalAmount.toLocaleString()}</strong>
            </div>
            <button className="payment-nav-btn" onClick={onGoToPayment}>
              注文履歴・お会計へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
