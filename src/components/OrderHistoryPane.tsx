// src/components/OrderHistoryPane.tsx
// ★ デザイン修正版

import React from "react";
// ★ Order, Option の型をインポート
import { Order, Option, CartItem } from "../types";

// ★ Order 型が items を JSON 文字列ではなく CartItem[] として持つことを期待
// (もし items が JSON 文字列のままなら、ここでパースする必要がある)
const parseOrderItems = (items: string | CartItem[]): CartItem[] => {
  if (typeof items === "string") {
    try {
      return JSON.parse(items);
    } catch (e) {
      console.error("Failed to parse order items:", e);
      return [];
    }
  }
  return items;
};

interface OrderHistoryPaneProps {
  pendingOrders: Order[];
  orderHistoryTotalAmount: number;
  onGoToPaymentView: () => void;
  onCallStaff: () => void;
}

const OrderHistoryPane: React.FC<OrderHistoryPaneProps> = ({
  pendingOrders,
  orderHistoryTotalAmount,
  onGoToPaymentView,
  onCallStaff,
}) => {
  return (
    <div className="history-pane-layout">
      {/* 1. 注文履歴メイン (左側) */}
      <div className="history-content-main">
        {pendingOrders.length === 0 ? (
          <div className="empty-history-message">
            <p>注文履歴はありません</p>
            <p>メニューから商品をご注文ください。</p>
          </div>
        ) : (
          pendingOrders.map((order) => (
            <div key={order.id} className="order-history-card">
              {/* ★ カードヘッダー (ID, ステータス, 合計金額) */}
              <div className="order-header-info">
                <span className="order-id">
                  注文 #{order.id}
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#888",
                      marginLeft: "10px",
                    }}
                  >
                    (
                    {new Date(order.timestamp).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    )
                  </span>
                </span>

                {/* ★ ステータス表示 (CSSに合わせてクラス名を変更) */}
                <span
                  className={`order-status ${
                    order.status === "調理中" ? "cooking" : "delivered"
                  }`}
                >
                  {order.status}
                </span>

                <span className="order-total">
                  ¥{order.total_price.toLocaleString()}
                </span>
              </div>

              {/* ★ 注文内容リスト */}
              <ul className="item-list">
                {parseOrderItems(order.items).map(
                  (item: CartItem, index: number) => (
                    <li key={`${item.id}-${index}`}>
                      <div className="item-detail">
                        <span>
                          {item.name} (x{item.quantity})
                        </span>
                        <span>
                          ¥{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      {/* オプション表示 */}
                      {item.selectedOptions &&
                        item.selectedOptions.length > 0 && (
                          <div className="item-options-list">
                            {item.selectedOptions
                              .map((opt: Option) => opt.name)
                              .join(", ")}
                          </div>
                        )}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* 2. 会計サイドバー (右側) */}
      <div className="history-summary-sidebar">
        <h3>お会計</h3>
        <h1>¥{orderHistoryTotalAmount.toLocaleString()}</h1>

        <button
          className="payment-button" // ★ CSSの .payment-button に合わせる
          onClick={onGoToPaymentView}
          disabled={orderHistoryTotalAmount === 0}
        >
          お会計に進む
        </button>

        <button
          className="call-button" // ★ CSSの .call-button に合わせる
          onClick={onCallStaff}
        >
          スタッフを呼び出す
        </button>
      </div>
    </div>
  );
};

export default OrderHistoryPane;
