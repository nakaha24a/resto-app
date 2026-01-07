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
  // 新しい順に並び替え
  const sortedOrders = [...pendingOrders].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

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
            <div key={order.id} className="history-card">
              <div
                className="history-card-header"
                style={{ justifyContent: "space-between" }}
              >
                <div className="history-time">
                  {order.timestamp
                    ? new Date(order.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </div>
                {/* ステータスバッジを削除し、シンプルに合計金額のみ表示 */}
                <div style={{ fontWeight: "bold" }}>
                  ¥
                  {(
                    order.totalAmount ||
                    order.totalPrice ||
                    0
                  ).toLocaleString()}
                </div>
              </div>

              <div className="history-items">
                {(order.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginTop: "8px",
                      borderBottom: "1px dashed #eee",
                      paddingBottom: "8px",
                    }}
                  >
                    <div
                      className="history-item-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="history-item-name">
                        <span
                          className="item-qty-badge"
                          style={{ marginRight: "8px", fontWeight: "bold" }}
                        >
                          x{item.quantity}
                        </span>
                        {item.name}
                      </div>
                      <div className="sub-total-price">
                        ¥{(item.totalPrice || 0).toLocaleString()}
                      </div>
                    </div>
                    {/* オプションがある場合のみシンプルに表示 */}
                    {item.selectedOptions &&
                      item.selectedOptions.length > 0 && (
                        <div
                          className="item-options-history"
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginLeft: "30px",
                          }}
                        >
                          {item.selectedOptions
                            .map((opt) =>
                              typeof opt === "string" ? opt : opt.name
                            )
                            .join(", ")}
                        </div>
                      )}
                  </div>
                ))}
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
            店員呼出
          </button>

          <button
            className="goto-payment-btn"
            onClick={onGoToPaymentView}
            disabled={sortedOrders.length === 0}
          >
            お会計へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPane;
