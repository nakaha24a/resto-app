/* src/components/CartSidebar.tsx */
import React from "react";
import useCartStore from "../store/cartStore";
import { CartItem } from "../types";

interface CartSidebarProps {
  cart: CartItem[];
  totalAmount: number; // 現在のカートのみの金額
  onPlaceOrder: () => void;
  onGoToPayment: () => void; // ★これを使います
  pendingOrderTotalAmount: number; // 確定済みの金額
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  totalAmount,
  onPlaceOrder,
  onGoToPayment,
  pendingOrderTotalAmount,
}) => {
  const { updateCartItemQuantity, removeFromCart } = useCartStore();

  const handleQuantityChange = (
    index: number,
    currentQty: number,
    delta: number
  ) => {
    const newQuantity = currentQty + delta;
    if (newQuantity <= 0) {
      removeFromCart(index);
    } else {
      updateCartItemQuantity(index, newQuantity);
    }
  };

  // 表示用の合計金額（これまで ＋ いまカート）
  const grandTotal = pendingOrderTotalAmount + totalAmount;

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h2 className="cart-title">現在の注文</h2>
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart-container">
            <div className="empty-cart-icon">🛒</div>
            <p>カートは空です</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="item-info-row">
                <div className="cart-item-info">
                  <span className="item-name">{item.name}</span>
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <span className="item-options">
                      {item.selectedOptions
                        .map((opt) =>
                          typeof opt === "string" ? opt : opt.name
                        )
                        .join(", ")}
                    </span>
                  )}
                </div>
                <div className="item-price">
                  ¥{(item.totalPrice || 0).toLocaleString()}
                </div>
              </div>

              <div className="item-controls-row">
                <div className="quantity-adjuster">
                  <button
                    className="qty-btn"
                    onClick={() =>
                      handleQuantityChange(index, item.quantity, -1)
                    }
                  >
                    -
                  </button>
                  <span className="item-qty-val">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() =>
                      handleQuantityChange(index, item.quantity, 1)
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  className="remove-link"
                  onClick={() => removeFromCart(index)}
                >
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        {/* 金額情報の表示 */}
        <div
          style={{
            marginBottom: "15px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            border: "1px solid #eee",
          }}
        >
          {/* 注文済みの金額があれば表示 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              color: "#666",
              fontSize: "0.9rem",
            }}
          >
            <span>注文済み</span>
            <span>¥{pendingOrderTotalAmount.toLocaleString()}</span>
          </div>

          {/* カートの金額 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              color: "#666",
              fontSize: "0.9rem",
              borderBottom: "1px dashed #ccc",
              paddingBottom: "5px",
            }}
          >
            <span>＋ カート</span>
            <span>¥{totalAmount.toLocaleString()}</span>
          </div>

          {/* お支払い総額 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#333" }}
            >
              合計
            </span>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                color: "#d32f2f",
              }}
            >
              ¥{grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ★ここを修正: ボタンを2つに分けました */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* 1. 注文確定ボタン (カートに物がある時だけ押せる) */}
          <button
            className="place-order-btn"
            disabled={cart.length === 0}
            onClick={onPlaceOrder}
            style={{
              // カートが空なら目立たなく、入っていれば目立つ色に
              backgroundColor: cart.length > 0 ? "#111" : "#e0e0e0",
              color: cart.length > 0 ? "#fff" : "#a0a0a0",
              cursor: cart.length > 0 ? "pointer" : "default",
              fontWeight: "bold",
              padding: "15px",
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem",
            }}
          >
            {cart.length > 0
              ? "注文を確定する"
              : "追加する商品を選んでください"}
          </button>

          {/* 2. お会計ボタン (注文済みの金額がある時だけ表示) */}
          {pendingOrderTotalAmount > 0 && (
            <button
              onClick={onGoToPayment}
              style={{
                backgroundColor: "#d32f2f", // 赤色で「お会計」感を出す
                color: "white",
                padding: "15px",
                borderRadius: "8px",
                border: "none",
                fontSize: "1.1rem",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "5px",
                boxShadow: "0 2px 5px rgba(211, 47, 47, 0.3)",
              }}
            >
              お会計へ進む (¥{pendingOrderTotalAmount.toLocaleString()})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
