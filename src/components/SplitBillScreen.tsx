// src/components/SplitBillScreen.tsx

import React, { useState } from "react";

interface SplitBillScreenProps {
  totalAmount: number;
  onCallStaff: () => void;
  onBack: () => void;
}

const SplitBillScreen: React.FC<SplitBillScreenProps> = ({
  totalAmount,
  onCallStaff,
  onBack,
}) => {
  // 割り勘人数 (初期値は2人)
  const [personCount, setPersonCount] = useState<number>(2);

  // 1人あたりの金額を計算 (1円未満は切り上げ)
  const amountPerPerson = Math.ceil(totalAmount / personCount);

  const handleCountChange = (change: number) => {
    setPersonCount((prevCount) => Math.max(1, prevCount + change)); // 最低1人
  };

  return (
    <div className="screen split-bill-screen">
      <h2 style={{ color: "#2ecc71" }}>均等割り勘計算</h2>

      <div className="summary-box">
        <p>
          合計金額:{" "}
          <strong style={{ fontSize: "1.5em" }}>
            ¥{totalAmount.toLocaleString()}
          </strong>
        </p>
      </div>

      <div className="split-control">
        <h3>割り勘する人数</h3>
        <div className="person-counter">
          <button
            onClick={() => handleCountChange(-1)}
            disabled={personCount <= 1}
          >
            -
          </button>
          <span className="count-display">{personCount} 人</span>
          <button onClick={() => handleCountChange(1)}>+</button>
        </div>
      </div>

      <div className="result-box">
        <h3>1人あたりの金額 (1円未満切り上げ)</h3>
        <p className="amount-result">
          <strong>¥{amountPerPerson.toLocaleString()}</strong>
        </p>
      </div>

      <div className="split-message">
        <p>この金額を参考に、レジにてお支払いください。</p>
        <p style={{ fontWeight: "bold" }}>※この画面で支払いは完了しません。</p>
      </div>

      <div className="split-controls-footer">
        <button onClick={onBack} className="back-button">
          会計オプションに戻る
        </button>
        <button onClick={onCallStaff} className="call-staff-button-large">
          会計を依頼する (スタッフ呼び出し)
        </button>
      </div>
    </div>
  );
};

export default SplitBillScreen;
