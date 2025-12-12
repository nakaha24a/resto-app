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
          {cart.reduce((sum, i) => sum + i.quantity, 0)} 点
        </span>
      </div>

      {/* 商品リスト */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart-container">
            <div className="empty-cart-icon">🍽️</div>
            <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              カートは空です
            </p>
            <p style={{ fontSize: "0.9rem" }}>
              メニューから商品を選んで
              <br />
              追加してください
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.uniqueId} className="cart-item">
              {/* 上段：名前と価格 */}
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

              {/* 下段：操作ボタン */}
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
              <span>合計 (税込)</span>
              <span className="total-price">
                ¥{totalAmount.toLocaleString()}
              </span>
            </div>
            <button className="place-order-btn" onClick={onPlaceOrder}>
              注文を確定する
            </button>
          </div>
        )}

        {/* 会計待ちボタン */}
        {pendingOrderTotalAmount > 0 && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              backgroundColor: "#fff8e1",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid #ffe0b2",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                color: "#333",
                fontSize: "0.95rem",
              }}
            >
              <span>お会計待ち金額</span>
              <strong style={{ color: "#e64a19" }}>
                ¥{pendingOrderTotalAmount.toLocaleString()}
              </strong>
            </div>
            <button
              onClick={onGoToPayment}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#fff",
                color: "#e65100",
                border: "1px solid #e65100",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              注文履歴・お会計へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
