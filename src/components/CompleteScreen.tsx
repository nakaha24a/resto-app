// src/components/CompleteScreen.tsx

import React from "react";
import { Order } from "../types";

interface CompleteScreenProps {
  order: Order | null;
  status: string;
  onGoBack: () => void;
}

const CompleteScreen: React.FC<CompleteScreenProps> = ({
  order,
  status,
  onGoBack,
}) => {
  if (!order) {
    return (
      <div className="screen complete-screen">
        <h2>注文がありません</h2>
        <p>前の画面に戻って注文を完了してください。</p>
        <button onClick={onGoBack}>メニューに戻る</button>
      </div>
    );
  }

  const calculateTotal = () => {
    // order.itemsはOrderItem型（quantityを含む）なので計算可能
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="screen complete-screen">
      <h2>ご注文完了</h2>
      <p>
        ご注文番号：<strong>#{order.id}</strong>
      </p>
      <p className="order-summary-message">
        ご注文ありがとうございます。お席（**席番号：{order.tableNumber}
        **）まで担当者がお伺いします。
      </p>

      {/* 注文内容の表示 */}
      <div className="order-summary-details">
        <h3>ご注文内容</h3>
        <ul>
          {order.items.map((item) => (
            <li key={item.id}>
              {item.name} x {item.quantity} - ¥{item.price * item.quantity}
            </li>
          ))}
        </ul>
        <p>
          <strong>合計金額: ¥{calculateTotal()}</strong>
        </p>
      </div>

      <button onClick={onGoBack}>追加注文する</button>
    </div>
  );
};

export default CompleteScreen;
