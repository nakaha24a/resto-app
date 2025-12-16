import React from "react";
import useCartStore from "../store/cartStore";
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
  const { updateCart, removeFromCart } = useCartStore();

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeFromCart(item.uniqueId);
    } else {
      updateCart(item, delta, item.selectedOptions);
    }
  };

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h2 className="cart-title">現在の注文</h2>
        <span className="cart-count-badge">
          {cart.reduce((sum, item) => sum + item.quantity, 0)}点
        </span>
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart-container">
            <div className="empty-cart-icon">🛒</div>
            <p>カートは空です</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.uniqueId || item.id} className="cart-item">
              <div className="item-info-row">
                <div className="cart-item-info">
                  <span className="item-name">{item.name}</span>
                  {/* オプション表示 */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <span className="item-options">
                      {item.selectedOptions.map((o) => o.name).join(", ")}
                    </span>
                  )}
                </div>
                {/* ★修正ポイント: ここで安全にtoLocaleStringを呼び出す */}
                <span className="item-price">
                  ¥{(item.totalPrice || 0).toLocaleString()}
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
                    className="qty-btn minus"
                    onClick={() => handleQuantityChange(item, -1)}
                  >
                    -
                  </button>
                  <span className="item-qty-val">{item.quantity}</span>
                  <button
                    className="qty-btn plus"
                    onClick={() => handleQuantityChange(item, 1)}
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
        {/* 未払い金額（注文済み）の表示 */}
        {(pendingOrderTotalAmount || 0) > 0 && (
          <div
            className="cart-total-row"
            style={{ color: "#666", fontSize: "0.9rem" }}
          >
            <span>注文済み未会計:</span>
            <span>¥{(pendingOrderTotalAmount || 0).toLocaleString()}</span>
          </div>
        )}

        {/* カート内合計 */}
        <div className="cart-total-row">
          <span>カート合計:</span>
          <span className="total-price">
            ¥{(totalAmount || 0).toLocaleString()}
          </span>
        </div>

        <div className="cart-actions">
          <button
            className="place-order-btn"
            onClick={onPlaceOrder}
            disabled={cart.length === 0}
            style={{ marginBottom: "10px" }}
          >
            注文を確定する
          </button>

          <button
            className="goto-payment-btn"
            onClick={onGoToPayment}
            // 注文済みがある場合のみ押せるようにする、などの制御はお好みで
            disabled={(pendingOrderTotalAmount || 0) === 0 && cart.length === 0}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>

            <span>お会計へ進む</span>

            {/* 矢印アイコン（右側） */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: "auto" }} /* 右端に寄せる */
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
