import React, { useState, useMemo } from "react";
// useTotalBillAmount は cartStore.tsで定義されていることを前提とする
import { useTotalBillAmount } from "../store/cartStore";

interface PaymentOptionsScreenProps {
  // 以前の割り勘や店員呼び出しのPropsは残しますが、使用しません
  onGoToSplitBill: () => void;
  onCallStaff: (message: string) => void;
  onBack: () => void;
  onPaymentComplete: () => void;
}

const PaymentOptionsScreen: React.FC<PaymentOptionsScreenProps> = ({
  onBack,
  onPaymentComplete,
}) => {
  const totalAmount = useTotalBillAmount();
  // ★ 状態管理: デフォルトを2人とする
  const [peopleCount, setPeopleCount] = useState(2);

  // ★ 割り勘計算ロジック
  const splitResult = useMemo(() => {
    if (peopleCount <= 0 || totalAmount <= 0) {
      return { perPerson: 0 };
    }
    // 小数点以下切り上げ（日本の飲食店会計の一般的な慣習）
    const perPerson = Math.ceil(totalAmount / peopleCount);
    return { perPerson };
  }, [totalAmount, peopleCount]);

  // 人数増減ハンドラ
  const handleCountChange = (delta: number) => {
    setPeopleCount((prev) => Math.max(1, prev + delta));
  };

  // 念のため、割り勘結果をゼロにしたくない場合は、こちらを使用します:
  const displayPerPerson = totalAmount > 0 ? splitResult.perPerson : 0;

  return (
    <div
      className="screen payment-options-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
        textAlign: "center",
        overflowY: "auto", // 内容が多い場合にスクロールできるように追加
      }}
    >
      <h2
        className="screen-title"
        style={{ marginBottom: "40px", fontSize: "24px", color: "#333" }}
      >
        お会計確認
      </h2>

      {/* 合計金額表示 */}
      <div className="payment-summary" style={{ marginBottom: "40px" }}>
        <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "15px" }}>
          お支払い合計 (税込)
        </p>
        <p
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            color: "#dc2626",
            margin: 0,
          }}
        >
          ¥{totalAmount.toLocaleString()}
        </p>
      </div>

      {/* ★ 割り勘人数コントロール */}
      <div
        style={{
          marginBottom: "40px",
          width: "100%",
          maxWidth: "300px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "15px",
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>割り勘人数</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => handleCountChange(-1)}
            disabled={peopleCount <= 1}
            style={{
              fontSize: "24px",
              padding: "10px 20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: peopleCount <= 1 ? "#eee" : "#fff",
            }}
          >
            -
          </button>
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>
            {peopleCount} 名
          </span>
          <button
            onClick={() => handleCountChange(1)}
            style={{
              fontSize: "24px",
              padding: "10px 20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: "#fff",
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* ★ 割り勘結果表示 */}
      <div style={{ marginBottom: "60px" }}>
        <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "10px" }}>
          1人あたりの金額
        </p>
        <p
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#059669",
            margin: 0,
          }}
        >
          ¥{displayPerPerson.toLocaleString()}
        </p>
        <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "5px" }}>
          {/* 切り上げ処理を行った場合の合計金額と差額を表示（任意） */}
          (合計 {peopleCount}名 × ¥{displayPerPerson.toLocaleString()} = ¥
          {(displayPerPerson * peopleCount).toLocaleString()})
        </p>
      </div>

      {/* 会計確定ボタン (これで完了) */}
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <button
          onClick={onPaymentComplete}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "20px",
            fontSize: "1.5rem",
            borderRadius: "50px",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
            cursor: "pointer",
            width: "100%",
          }}
        >
          支払い完了へ
        </button>
      </div>

      {/* ▼▼▼ 追加した戻るボタン ▼▼▼ */}
      <button
        className="back-button-bottom" /* CSSクラスがあれば適用 */
        onClick={onBack}
        style={{
          marginTop: "30px",
          padding: "12px 30px",
          background: "transparent",
          border: "2px solid #ccc",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "bold",
          color: "#666",
          cursor: "pointer",
          marginBottom: "20px", // 下に余白
        }}
      >
        ← 注文画面に戻る
      </button>
      {/* ▲▲▲ ここまで ▲▲▲ */}
    </div>
  );
};

export default PaymentOptionsScreen;
