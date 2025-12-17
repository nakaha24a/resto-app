import React from "react";
import useCartStore, { useCartTotalAmount } from "../store/cartStore";
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
  // ★修正: updateCartItemQuantity を使う
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
          // ★修正: index を使って管理する
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="item-info-row">
                <div className="cart-item-info">
                  <span className="item-name">{item.name}</span>
                  {/* ★修正: オプションは文字列の配列なのでそのまま join */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <span className="item-options">
                      {item.selectedOptions.join(", ")}
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
        <div className="cart-total-row">
          <span>合計</span>
          <span className="total-price">¥{totalAmount.toLocaleString()}</span>
        </div>
        <button
          className="place-order-btn"
          disabled={cart.length === 0}
          onClick={onPlaceOrder}
        >
          注文を確定する
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;
