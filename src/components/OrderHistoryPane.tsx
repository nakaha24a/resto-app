import React from "react";
import { Order, OrderItem } from "../types"; // ★ 修正: CartItem ではなく OrderItem をインポート

interface OrderHistoryPaneProps {
  pendingOrders: Order[];
  orderHistoryTotalAmount: number;
  onGoToPaymentView: () => void;
  onCallStaff: () => void;
}

// ★ 修正: parseOrderItems 関数は不要になったため削除
// (order.items は既に OrderItem[] のため、TS2345エラー解消)

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
                    // ★ 修正: "調理中" -> "PENDING" (TS2367エラー解消)
                    order.status === "PENDING" ? "cooking" : "delivered"
                  }`}
                >
                  {/* ★ 修正: 英語のステータスを日本語に変換して表示 */}
                  {order.status === "PENDING"
                    ? "調理中"
                    : order.status === "COMPLETED"
                    ? "提供済み"
                    : "キャンセル"}
                </span>
                <span className="order-total">
                  {/* ★ 修正: total_price -> totalAmount (TS2339エラー解消) */}¥
                  {order.totalAmount.toLocaleString()}
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
                    {/* オプションも表示（履歴用にスタイルを追加） */}
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
