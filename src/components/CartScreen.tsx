// src/components/CartScreen.tsx

import React from "react";
import { CartItem, OrderItem } from "../types";

interface CartScreenProps {
  cart: CartItem[];
  onUpdateCart: (item: OrderItem, quantityChange: number) => void;
  onGoToCheckout: () => void;
  onBackToOrder: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  onUpdateCart,
  onGoToCheckout,
  onBackToOrder,
}) => {
  const calculateTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleUpdateQuantity = (item: CartItem, change: number) => {
    // CartItemをOrderItemとして渡し、数量を変更
    onUpdateCart(item, change);
  };

  return (
    <div className="screen cart-screen">
      <h2>ご注文の確認</h2>

      {cart.length === 0 ? (
        <p>カートに商品が入っていません。</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.name} (¥{item.price}) - 数量: {item.quantity}
              <button onClick={() => handleUpdateQuantity(item, 1)}>+</button>
              <button onClick={() => handleUpdateQuantity(item, -1)}>-</button>
            </li>
          ))}
        </ul>
      )}

      <h3>合計金額: ¥{calculateTotal}</h3>

      <button onClick={onBackToOrder}>追加注文に戻る</button>
      <button onClick={onGoToCheckout} disabled={cart.length === 0}>
        注文確定へ進む
      </button>
    </div>
  );
};

export default CartScreen;
