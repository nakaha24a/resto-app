// src/components/OrderHistoryPane.tsx

import React from "react";
// ★ Option をインポートに追加
import { Order, OrderItem, Option } from "../types";

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
                    {/* ★ totalAmount から total_price に修正 */}
                    **¥
                    {order.total_price
                      ? order.total_price.toLocaleString()
                      : "計算中"}
                    **
                  </span>
                </div>
                <ul className="item-list">
                  {(() => {
                    try {
                      const itemsArray = JSON.parse(
                        order.items as unknown as string
                      );

                      return itemsArray.map(
                        (item: OrderItem, index: number) => (
                          <li
                            key={`${order.id}-${item.id || index}`}
                            className="item-detail"
                          >
                            <span>{item.name}</span>
                            {/* オプション表示 */}
                            {item.selectedOptions &&
                              item.selectedOptions.length > 0 && (
                                <ul
                                  style={{
                                    fontSize: "0.8em",
                                    color: "#555",
                                    marginLeft: "10px",
                                  }}
                                >
                                  {/* ★ Option 型を明示 */}
                                  {item.selectedOptions.map((opt: Option) => (
                                    <li key={opt.name}>
                                      + {opt.name} (¥
                                      {opt.price.toLocaleString()})
                                    </li>
                                  ))}
                                </ul>
                              )}
                            <span className="quantity-price">
                              {item.quantity} 点 @ ¥
                              {(
                                item.price +
                                (item.selectedOptions?.reduce(
                                  (sum, opt) => sum + opt.price,
                                  0
                                ) || 0)
                              ).toLocaleString()}
                            </span>
                          </li>
                        )
                      );
                    } catch (e) {
                      console.error(
                        "注文項目のパースに失敗:",
                        e,
                        "データ:",
                        order.items
                      );
                      return <li>注文項目の表示エラー</li>;
                    }
                  })()}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右側: 合計額とアクションボタン */}
      <div className="history-summary-sidebar">
        <h3 className="text-2xl font-bold mb-4 text-gray-700">未会計 合計</h3>
        <h1 className="text-6xl font-extrabold text-red-600 mb-8">
          ¥{orderHistoryTotalAmount.toLocaleString()}
        </h1>

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
