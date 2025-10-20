// src/components/OrderHistoryPane.tsx (修正後)

import React from "react";
import { Order, OrderItem } from "../types";

interface OrderHistoryPaneProps {
  pendingOrders: Order[]; // 未会計の確定済み注文リスト
  orderHistoryTotalAmount: number; // 確定済み注文の合計額
  onGoToPaymentView: () => void; // お会計選択画面へ遷移するハンドラ
  onCallStaff: () => void;
}

const OrderHistoryPane: React.FC<OrderHistoryPaneProps> = ({
  pendingOrders,
  orderHistoryTotalAmount,
  onGoToPaymentView,
  onCallStaff,
}) => {
  const isReadyToPay = pendingOrders.length > 0;

  return (
    // CSSクラス 'history-pane-layout' により左右分割される
    <div className="history-pane-layout">
      {/* 左側: 履歴リスト (CSSクラス 'history-content-main' でスクロール可能に) */}
      <div className="history-content-main">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b-4 border-teal-500 pb-2">
          🧾 確定済み注文履歴 (未会計)
        </h2>

        {pendingOrders.length === 0 ? (
          <div className="empty-history-message">
            <p className="text-2xl text-gray-500 italic mt-10">
              まだ確定したご注文はありません。
            </p>
            <p className="text-lg text-gray-400 mt-2">
              注文タブから商品を選び、「注文を確定する」を押してください。
            </p>
          </div>
        ) : (
          <div className="order-list-scroll">
            {pendingOrders.map((order) => (
              <div key={order.id} className="order-history-card">
                <div className="order-header-info">
                  <span className="order-id">注文 **#{order.id}**</span>
                  <span className="order-timestamp">
                    {new Date(order.timestamp).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    確定
                  </span>
                  <span className="order-total">
                    **¥{order.totalAmount.toLocaleString()}**
                  </span>
                </div>
                <ul className="item-list">
                  {order.items.map((item: OrderItem) => (
                    <li key={item.id} className="item-detail">
                      <span>{item.name}</span>
                      <span className="quantity-price">
                        {item.quantity} 点 @ ¥{item.price.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右側: 合計額とアクションボタン (CSSクラス 'history-summary-sidebar' で固定幅サイドバーに) */}
      <div className="history-summary-sidebar">
        <h3 className="text-2xl font-bold mb-4 text-gray-700">未会計 合計</h3>
        <h1 className="text-6xl font-extrabold text-red-600 mb-8">
          ¥{orderHistoryTotalAmount.toLocaleString()}
        </h1>

        {/* お会計に進むボタン */}
        <button
          onClick={onGoToPaymentView}
          disabled={!isReadyToPay}
          className="py-4 px-6 bg-red-600 text-white rounded-xl text-xl font-bold hover:bg-red-700 transition shadow-lg w-full mb-4"
        >
          <span role="img" aria-label="money">
            💳
          </span>{" "}
          お会計に進む
        </button>

        {/* スタッフ呼び出しボタン */}
        <button
          onClick={onCallStaff}
          className="py-4 px-6 bg-yellow-500 text-gray-800 rounded-xl text-xl font-bold hover:bg-yellow-600 transition shadow-lg w-full"
        >
          <span role="img" aria-label="bell">
            🛎️
          </span>{" "}
          スタッフ呼び出し
        </button>
      </div>
    </div>
  );
};

export default OrderHistoryPane;
