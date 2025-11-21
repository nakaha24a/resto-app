import React from "react";
import { Order, OrderItem } from "../types";

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
  // 日付フォーマット用ヘルパー
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div className="history-container">
      <h2 className="history-section-title">注文履歴</h2>

      <div className="history-list">
        {pendingOrders.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: "20px" }}>
            まだ注文履歴がありません。
          </p>
        ) : (
          pendingOrders.map((order) => (
            <div key={order.id} className="history-order-item">
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    marginBottom: "4px",
                    fontSize: "0.85rem",
                    color: "#757575",
                  }}
                >
                  {/* ★ 日時フォーマットの安全策 */}
                  <span style={{ marginRight: "10px" }}>
                    {formatDate(order.timestamp)}
                  </span>
                  <span
                    className={`history-status status-${
                      order.status === "調理中" ? "cooking" : "received"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {order.items.map((item: OrderItem, idx: number) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      {/* ★ 金額フォーマットの安全策 (item.totalPrice || 0) */}
                      <span>¥{(item.totalPrice || 0).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className="cart-footer"
        style={{
          marginTop: "20px",
          backgroundColor: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        <div className="cart-total">
          <span>合計</span>
          {/* ★ 合計金額フォーマットの安全策 */}
          <span>¥{(orderHistoryTotalAmount || 0).toLocaleString()}</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginTop: "1rem",
          }}
        >
          <button
            className="order-button"
            style={{
              backgroundColor: "#fff",
              color: "#555",
              border: "1px solid #ccc",
            }}
            onClick={onCallStaff}
          >
            スタッフ呼出
          </button>
          <button className="place-order-btn" onClick={onGoToPaymentView}>
            お会計へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPane;
