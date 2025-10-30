// src/components/SplitBillScreen.tsx

import React, { useState, useMemo } from "react";
// ★ usePendingOrderTotalAmount をインポート
import useCartStore, { usePendingOrderTotalAmount } from "../store/cartStore";

interface SplitBillScreenProps {
  onCallStaff: (message: string) => void;
  onBack: () => void;
}

type RoundingOption = "CEIL" | "NONE";

const SplitBillScreen: React.FC<SplitBillScreenProps> = ({
  onCallStaff,
  onBack,
}) => {
  // ★ フックを使って合計金額を取得
  const pendingOrderTotalAmount = usePendingOrderTotalAmount();

  const [personCount, setPersonCount] = useState<number>(2);
  const [roundingOption, setRoundingOption] = useState<RoundingOption>("CEIL");

  const { amountPerPerson, remainder, baseAmount, lastPersonAmount } =
    useMemo(() => {
      if (pendingOrderTotalAmount <= 0 || personCount <= 0)
        return {
          amountPerPerson: 0,
          remainder: 0,
          baseAmount: 0,
          lastPersonAmount: 0,
        };

      const rawAmount = pendingOrderTotalAmount / personCount;
      let finalAmount = 0;
      let remainderCalc = 0;
      let base = 0;
      let lastPerson = 0;

      if (roundingOption === "CEIL") {
        finalAmount = Math.ceil(rawAmount / 10) * 10;
        remainderCalc = finalAmount * personCount - pendingOrderTotalAmount;
      } else {
        // "NONE" (代表者が調整)
        base = Math.floor(rawAmount / 10) * 10;
        const totalOther = base * (personCount - 1);
        lastPerson = pendingOrderTotalAmount - totalOther;
      }

      return {
        amountPerPerson: finalAmount,
        remainder: remainderCalc,
        baseAmount: base,
        lastPersonAmount: lastPerson,
      };
    }, [pendingOrderTotalAmount, personCount, roundingOption]);

  const handleCallForPayment = () => {
    let message = `会計依頼 (合計: ${pendingOrderTotalAmount.toLocaleString()}円 / 割り勘人数: ${personCount}人)`;
    if (roundingOption === "CEIL") {
      message += ` / 一人あたり ${amountPerPerson.toLocaleString()}円)`;
    } else {
      message += ` / 代表者以外 ${baseAmount.toLocaleString()}円、代表者 ${lastPersonAmount.toLocaleString()}円)`;
    }
    onCallStaff(message);
  };

  const handleCountChange = (change: number) => {
    setPersonCount((prev) => Math.max(1, prev + change));
  };

  return (
    <div className="screen split-bill-screen">
      <h2 className="screen-title">🧑‍🤝‍🧑 お会計 (割り勘計算)</h2>

      <div className="split-controls">
        <div className="control-group person-count-selector">
          <label>割り勘人数:</label>
          <div className="count-stepper">
            <button
              onClick={() => handleCountChange(-1)}
              disabled={personCount <= 1}
            >
              ー
            </button>
            <span className="current-count">{personCount} 人</span>
            <button onClick={() => handleCountChange(1)}>＋</button>
          </div>
        </div>

        <div className="control-group rounding-options">
          <label>端数処理方法:</label>
          <div className="option-buttons">
            <button
              className={`option-btn ${
                roundingOption === "CEIL" ? "active" : ""
              }`}
              onClick={() => setRoundingOption("CEIL")}
            >
              全員切り上げ (¥10単位)
            </button>
            <button
              className={`option-btn ${
                roundingOption === "NONE" ? "active" : ""
              }`}
              onClick={() => setRoundingOption("NONE")}
            >
              代表者が調整
            </button>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <p className="total-display">
          全体の合計金額:{" "}
          <strong>¥{pendingOrderTotalAmount.toLocaleString()}</strong>
        </p>
      </div>

      <div className="calculation-result-box">
        <h3 className="result-title">計算結果</h3>

        {personCount === 1 && (
          <>
            <p className="amount-label">お支払い金額:</p>
            <p className="amount-result main-amount">
              <strong>¥{pendingOrderTotalAmount.toLocaleString()}</strong>
            </p>
          </>
        )}
        {personCount > 1 && roundingOption === "CEIL" && (
          // ★↓ React Fragment で囲む ↓
          <>
            <p className="amount-label">1人あたりの支払額 (全員):</p>
            <p className="amount-result main-amount">
              <strong>¥{amountPerPerson.toLocaleString()}</strong>
            </p>
            {remainder > 0 && (
              <p className="note-text">
                ※10円単位で切り上げました。合計で¥{remainder.toLocaleString()}{" "}
                のお釣りが出ます。
              </p>
            )}
          </> // ★↑ React Fragment で囲む ↑
        )}
        {personCount > 1 && roundingOption === "NONE" && (
          // ★↓ React Fragment で囲む ↓
          <>
            <p className="amount-label">
              代表者以外の支払額 ({personCount - 1}人):
            </p>
            <p className="amount-result sub-amount">
              <strong>¥{baseAmount.toLocaleString()}</strong>
            </p>
            <p className="amount-label adjusted-label">代表者の支払額 (1人):</p>
            <p className="amount-result main-amount adjusted-amount">
              <strong>¥{lastPersonAmount.toLocaleString()}</strong>
            </p>
            {lastPersonAmount - baseAmount !== 0 && (
              <p className="note-text adjusted-note">
                ※代表者が端数 (¥
                {(lastPersonAmount - baseAmount).toLocaleString()} 円)
                を調整します。
              </p>
            )}
          </> // ★↑ React Fragment で囲む ↑
        )}
      </div>

      <div className="split-controls-footer">
        <button className="back-button" onClick={onBack}>
          <span role="img" aria-label="back">
            ←
          </span>{" "}
          戻る
        </button>
        <button
          className="call-staff-button-large"
          onClick={handleCallForPayment}
        >
          <span role="img" aria-label="hand">
            ✋
          </span>{" "}
          会計依頼 (店員呼び出し)
        </button>
      </div>
    </div>
  );
};

export default SplitBillScreen;
