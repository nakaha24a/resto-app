// src/components/CheckoutScreen.tsx

import React from "react";
import { CartItem, Order } from "../types";

interface CheckoutScreenProps {
  orderItems: CartItem[];
  onPlaceOrder: (orderData: Order) => void;
  onBackToOrder: () => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  orderItems,
  onPlaceOrder,
  onBackToOrder,
}) => {
  const calculateTotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrderClick = () => {
    // 注文オブジェクトを作成
    const newOrder: Order = {
      id: new Date().getTime().toString(), // 仮の注文ID
      tableNumber: "", // App.tsxでタブレットIDに上書きされる
      items: orderItems,
    };

    // App.tsxのhandlePlaceOrderを呼び出し、注文を確定する
    onPlaceOrder(newOrder);
  };

  return (
    <div className="screen checkout-screen">
      <h2>最終注文確認</h2>

      <div className="order-details-box">
        <h3>ご注文内容の確認</h3>
        <ul className="final-order-list">
          {orderItems.map((item) => (
            <li key={item.id}>
              {item.name} x {item.quantity} = ¥{item.price * item.quantity}
            </li>
          ))}
        </ul>

        <h1>合計金額: ¥{calculateTotal}</h1>

        <p className="note">代金は後ほどお席でスタッフにお支払いください。</p>
        <p className="confirm-message">
          この内容でよろしければ、「注文を完了する」ボタンを押してください。
        </p>
      </div>

      <div className="checkout-controls">
        <button onClick={onBackToOrder} className="back-button">
          注文内容を修正する
        </button>
        <button onClick={handlePlaceOrderClick} className="place-order-button">
          注文を完了する
        </button>
      </div>
    </div>
  );
};

export default CheckoutScreen;
