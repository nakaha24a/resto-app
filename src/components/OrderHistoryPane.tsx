import React from "react";
import { Order, OrderItem } from "../types"; // ★ 修正: OrderItem をインポート

interface OrderHistoryPaneProps {
  pendingOrders: Order[];
  orderHistoryTotalAmount: number;
  onGoToPaymentView: () => void;
  onCallStaff: () => void;
}

// ★ 修正: parseOrderItems 関数は不要になったため削除
// (cartStore が items を OrderItem[] に変換済みの想定)

const OrderHistoryPane: React.FC<OrderHistoryPaneProps> = ({
  pendingOrders,
  orderHistoryTotalAmount,
  onGoToPaymentView,
  onCallStaff,
}) => {
  return (
    <div className="history-pane-layout">
      <div className="history-content-main">
        <h2>提供待ちのご注文 ( {pendingOrders.length}件 )</h2>
        {pendingOrders.length === 0 ? (
          <div className="empty-history-message">
            <p>現在、提供待ちのご注文はありません。</p>
            <p>「注文」タブから新しいご注文ができます。</p>
          </div>
        ) : (
          pendingOrders.map((order) => (
            <div key={order.id} className="order-history-card">
              <div className="order-header-info">
                <span className="order-id">注文ID: {order.id}</span>
                <span
                  className={`order-status ${
                    // ★ 修正: "PENDING" -> "調理中" (server.js に合わせる)
                    order.status === "調理中" ? "cooking" : "delivered"
                  }`}
                >
                  {/* ★ 修正: status をそのまま表示 (型で "調理中" などが保証される) */}
                  {order.status}
                </span>
                <span className="order-total">
                  {/* ★ 修正: total_price -> totalAmount (types/index.ts に合わせる) */}
                  ¥{order.totalAmount.toLocaleString()}
                </span>
              </div>

              {/* ★ 修正: order.items (OrderItem[]) を直接マップ */}
              <ul className="item-list">
                {order.items.map((item: OrderItem, index: number) => (
                  <li key={`${item.menuItemId}-${index}`}>
                    <div className="item-detail">
                      <span>
                        {item.name} (x{item.quantity})
                      </span>
                      <span>¥{item.totalPrice.toLocaleString()}</span>
                    </div>
                    {/* オプションも表示 */}
                    {item.options && item.options.length > 0 && (
                      <div className="item-options-history">
                        {item.options.map((opt) => `+ ${opt.name}`).join(" ")}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <aside className="history-summary-sidebar">
        <h3>お会計</h3>
        <h1>¥{orderHistoryTotalAmount.toLocaleString()}</h1>

        <button
          className="payment-button"
          onClick={onGoToPaymentView}
          disabled={orderHistoryTotalAmount === 0}
        >
          お会計に進む
        </button>
        <button className="call-button" onClick={onCallStaff}>
          スタッフを呼び出す
        </button>
      </aside>
    </div>
  );
};

export default OrderHistoryPane;
