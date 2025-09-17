import React from "react";
import { CartItem, Member } from "../types";

interface CartScreenProps {
  cart: CartItem[];
  members: Member[];
  onBackToOrder: () => void;
  onGoToCheckout: () => void; // 会計画面への遷移関数を追加
}

const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  members,
  onBackToOrder,
  onGoToCheckout,
}) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getMemberName = (id: number): string => {
    const member = members.find((m) => m.id === id);
    return member?.name || `参加者${id}`;
  };

  return (
    <div className="screen cart-screen">
      <h2>カート確認</h2>
      <ul className="cart-list">
        {cart.map((item, index) => (
          <li key={index} className="cart-item">
            <span>{item.name}</span>
            <span>x {item.quantity}</span>
            <span>¥{item.price * item.quantity}</span>
            <span>({getMemberName(item.orderedBy)})</span>
          </li>
        ))}
      </ul>
      <div className="total">
        <strong>合計金額: ¥{total}</strong>
      </div>
      <div className="button-group">
        <button onClick={onBackToOrder}>メニューに戻る</button>
        <button onClick={onGoToCheckout}>注文を確定する</button>
      </div>
    </div>
  );
};

export default CartScreen;
