import React from "react";
import { CartItem, Member } from "../types";

interface CartScreenProps {
  cart: CartItem[];
  members: Member[];
  onUpdateCart: (cart: CartItem[]) => void;
  onBackToOrder: () => void;
  onGoToSplitBill: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  members,
  onUpdateCart,
  onBackToOrder,
  onGoToSplitBill,
}) => {
  const getMemberName = (id: number): string => {
    const member = members.find((m) => m.id === id);
    return member?.name || `参加者${id}`;
  };

  const handleUpdateQuantity = (
    itemId: string,
    memberId: number,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      onUpdateCart(
        cart.filter(
          (item) => !(item.id === itemId && item.orderedBy === memberId)
        )
      );
    } else {
      onUpdateCart(
        cart.map((item) =>
          item.id === itemId && item.orderedBy === memberId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="screen cart-screen">
      <h2>カート確認・編集</h2>
      <ul className="cart-list">
        {cart.length === 0 ? (
          <p>カートは空です。</p>
        ) : (
          cart.map((item) => (
            <li key={`${item.id}-${item.orderedBy}`} className="cart-item">
              <div className="cart-item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-details">
                  {getMemberName(item.orderedBy)} / ¥{item.price}
                </span>
              </div>
              <div className="quantity-controls">
                <button
                  onClick={() =>
                    handleUpdateQuantity(
                      item.id,
                      item.orderedBy,
                      item.quantity - 1
                    )
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(
                      item.id,
                      item.orderedBy,
                      item.quantity + 1
                    )
                  }
                >
                  +
                </button>
              </div>
              <span>¥{item.price * item.quantity}</span>
            </li>
          ))
        )}
      </ul>
      <div className="cart-total">
        <strong>合計: ¥{total}</strong>
      </div>
      <div className="button-group">
        <button onClick={onBackToOrder}>メニューに戻る</button>
        <button
          className="cta-button"
          onClick={onGoToSplitBill}
          disabled={cart.length === 0}
        >
          会計に進む
        </button>
      </div>
    </div>
  );
};

export default CartScreen;
