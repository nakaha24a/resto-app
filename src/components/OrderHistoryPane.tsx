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
  // 注文データの新しい順ソート（ロジックは維持）
  const sortedOrders = [...pendingOrders].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div
      className="history-pane-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#fff",
        borderLeft: "1px solid #ddd", // 画面右端に置く場合の境界線
      }}
    >
      {/* --- ヘッダー部分 --- */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #eee",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#333" }}>
          注文履歴
        </h2>
      </div>

      {/* --- リスト部分 (ここをシンプルに) --- */}
      <div
        style={{
          flex: 1,
          overflowY: "auto", // スクロール可能に
          padding: "10px 20px",
        }}
      >
        {sortedOrders.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", marginTop: "30px" }}>
            まだ注文がありません
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sortedOrders.map((order) =>
              (order.items || []).map((item, itemIdx) => (
                <li
                  key={`${order.id}-${itemIdx}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "12px 0",
                    borderBottom: "1px dashed #eee", // 点線で軽く区切るだけ
                  }}
                >
                  {/* 左側: 商品名と数量・オプション */}
                  <div style={{ flex: 1, marginRight: "10px" }}>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {item.name}
                      <span style={{ marginLeft: "8px", color: "#2563eb" }}>
                        x{item.quantity}
                      </span>
                    </div>
                    {/* オプションがあれば小さく表示 */}
                    {item.selectedOptions &&
                      item.selectedOptions.length > 0 && (
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#888",
                            marginTop: "4px",
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

                  {/* 右側: 金額 */}
                  <div style={{ fontWeight: "bold", color: "#333" }}>
                    ¥{(item.totalPrice || 0).toLocaleString()}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* --- フッター部分 (合計とボタン) --- */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f9fafb",
          borderTop: "1px solid #ddd",
        }}
      >
        {/* 合計金額 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            fontSize: "1.3rem",
            fontWeight: "bold",
          }}
        >
          <span>合計</span>
          <span style={{ color: "#dc2626", fontSize: "1.6rem" }}>
            ¥{orderHistoryTotalAmount.toLocaleString()}
          </span>
        </div>

        {/* ボタンエリア */}
        <div style={{ display: "flex", gap: "10px" }}>
          {/* 店員呼出 */}
          <button
            onClick={onCallStaff}
            style={{
              flex: 1,
              padding: "15px",
              border: "2px solid #ddd",
              backgroundColor: "#fff",
              borderRadius: "8px",
              fontWeight: "bold",
              color: "#666",
              cursor: "pointer",
            }}
          >
            店員呼出
          </button>

          {/* お会計へ */}
          <button
            onClick={onGoToPaymentView}
            disabled={sortedOrders.length === 0}
            style={{
              flex: 2, // ボタンを広めに
              padding: "15px",
              border: "none",
              backgroundColor: sortedOrders.length === 0 ? "#ccc" : "#2563eb",
              borderRadius: "8px",
              fontWeight: "bold",
              color: "#fff",
              cursor: sortedOrders.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            お会計へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPane;
