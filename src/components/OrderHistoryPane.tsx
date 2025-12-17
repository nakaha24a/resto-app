import React from "react";
import { Order } from "../types";

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
  const sortedOrders = [...pendingOrders].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "調理中":
        return "status-cooking";
      case "提供済み":
        return "status-served";
      case "会計済み":
        return "status-paid";
      default:
        return "status-waiting";
    }
  };

  return (
    <div className="history-pane-container">
      <h2 className="history-title">注文履歴</h2>

      <div className="history-list">
        {sortedOrders.length === 0 ? (
          <div className="empty-history-message">
            <p>まだ注文履歴がありません</p>
          </div>
        ) : (
          sortedOrders.map((order) => (
            <div
              key={order.id}
              className={`history-card ${getStatusClass(order.status)}`}
            >
              <div className="history-card-header">
                <div className="history-time">
                  {order.timestamp
                    ? new Date(order.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                  {/* ★修正: 数値IDなので slice せずそのまま表示 */}
                  <span className="order-id">No. {order.id}</span>
                </div>
                <span
                  className={`status-badge ${getStatusClass(order.status)}`}
                >
                  {order.status || "受付"}
                </span>
              </div>

              <div className="history-items">
                {(order.items || []).map((item, idx) => (
                  <div key={idx}>
                    <div className="history-item-row">
                      <div className="history-item-name">
                        <span className="item-qty-badge">{item.quantity}</span>
                        {item.name}
                      </div>
                      <div className="sub-total-price">
                        ¥{(item.totalPrice || 0).toLocaleString()}
                      </div>
                    </div>
                    {/* オプション表示 */}
                    {item.selectedOptions &&
                      item.selectedOptions.length > 0 && (
                        <div className="item-options-history">
                          {item.selectedOptions.join(", ")}
                        </div>
                      )}
                  </div>
                ))}
              </div>

              <div className="history-card-footer">
                <span className="sub-total-label">小計</span>
                <span className="sub-total-price">
                  {/* totalAmount または totalPrice どちらかある方を使う */}¥
                  {(
                    order.totalAmount ||
                    order.totalPrice ||
                    0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="history-footer-summary">
        <div className="bill-total-row">
          <span>お支払い合計</span>
          <span className="bill-total-price">
            ¥{(orderHistoryTotalAmount || 0).toLocaleString()}
          </span>
        </div>

        <div className="history-actions">
          <button className="call-staff-btn-secondary" onClick={onCallStaff}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>店員呼出</span>
          </button>

          <button
            className="goto-payment-btn"
            onClick={onGoToPaymentView}
            disabled={sortedOrders.length === 0}
          >
            <span>お会計へ進む</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPane;
