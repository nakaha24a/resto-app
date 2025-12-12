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
  const { removeFromCart, updateCart } = useCartStore();

  const handleIncrease = (item: CartItem) => {
    updateCart(item, 1, item.selectedOptions);
  };

  const handleDecrease = (item: CartItem) => {
    updateCart(item, -1, item.selectedOptions);
  };

  return (
    <div className="cart-sidebar">
      {/* ヘッダー */}
      <div className="cart-header">
        <h2 className="cart-title">現在の注文</h2>
        <span style={{ fontSize: "0.9rem", color: "#888", fontWeight: "bold" }}>
          合計 {cart.reduce((sum, i) => sum + i.quantity, 0)} 点
        </span>
      </div>

      {/* アイテムリスト */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart-container">
            <div className="empty-cart-icon">🍽️</div>
            <p className="empty-cart-message">カートは空です</p>
            <p className="empty-cart-sub">
              メニューから商品を選んで
              <br />
              追加してください
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.uniqueId} className="cart-item">
              {/* 上段：商品名と価格 */}
              <div className="item-info-row">
                <div style={{ flex: 1 }}>
                  <div className="item-name">{item.name}</div>
                  {item.selectedOptions.length > 0 && (
                    <div className="item-options">
                      {item.selectedOptions.map((o) => o.name).join(", ")}
                    </div>
                  )}
                </div>
                <div className="item-price">
                  ¥{item.totalPrice.toLocaleString()}
                </div>
              </div>

              {/* 下段：削除ボタンと数量変更 */}
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

      {/* フッター */}
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

        {/* 会計待ちがある場合のみ表示 */}
        {pendingOrderTotalAmount > 0 && (
          <div className="payment-link-area">
            <div className="pending-info">
              <span>お会計待ち金額</span>
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
