// src/components/SplitBillScreen.tsx (修正)

import React, { useState, useMemo } from "react";

interface SplitBillScreenProps {
  totalAmount: number;
  onCallStaff: (message: string) => void;
  onBack: () => void;
}

type RoundingOption = "CEIL" | "NONE";

const SplitBillScreen: React.FC<SplitBillScreenProps> = ({
  totalAmount,
  onCallStaff,
  onBack,
}) => {
  const [personCount, setPersonCount] = useState<number>(2);
  const [roundingOption, setRoundingOption] = useState<RoundingOption>("CEIL");

  // 計算ロジック
  const { amountPerPerson, remainder, baseAmount, lastPersonAmount } =
    useMemo(() => {
      if (totalAmount <= 0)
        return {
          amountPerPerson: 0,
          remainder: 0,
          baseAmount: 0,
          lastPersonAmount: 0,
        };

      const rawAmount = totalAmount / personCount;
      let finalAmount = 0;
      let remainderCalc = 0;
      let base = 0;
      let lastPerson = 0;

      if (roundingOption === "CEIL") {
        // 全員切り上げ方式
        finalAmount = Math.ceil(rawAmount / 10) * 10; // 10円単位で切り上げ
        remainderCalc = finalAmount * personCount - totalAmount; // お釣りの合計
      } else {
        // 代表者調整方式
        base = Math.floor(rawAmount / 10) * 10; // 10円未満を切り捨てた額
        // 代表者以外の金額
        const totalOther = base * (personCount - 1);
        // 代表者の金額 (端数調整)
        lastPerson = totalAmount - totalOther;
      }

      return {
        amountPerPerson: finalAmount,
        remainder: remainderCalc,
        baseAmount: base,
        lastPersonAmount: lastPerson,
      };
    }, [totalAmount, personCount, roundingOption]);

  const handleCallForPayment = () => {
    const message = `会計依頼 (合計: ${totalAmount.toLocaleString()}円 / 割り勘人数: ${personCount}人)`;
    onCallStaff(message);
  };

  const handleCountChange = (change: number) => {
    setPersonCount((prev) => Math.max(2, prev + change));
  };

  return (
    <div className="screen split-bill-screen">
      <h2 className="screen-title">🧑‍🤝‍🧑 お会計 (割り勘計算)</h2>

      <div className="split-controls">
        {/* 人数選択 */}
        <div className="control-group person-count-selector">
          <label>割り勘人数:</label>
          <div className="count-stepper">
            <button
              onClick={() => handleCountChange(-1)}
              disabled={personCount <= 2}
            >
              ー
            </button>
            <span className="current-count">{personCount} 人</span>
            <button onClick={() => handleCountChange(1)}>＋</button>
          </div>
        </div>

        {/* 端数処理選択 */}
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
          全体の合計金額: <strong>¥{totalAmount.toLocaleString()}</strong>
        </p>
      </div>

      <div className="calculation-result-box">
        <h3 className="result-title">計算結果</h3>

        {roundingOption === "CEIL" ? (
          <>
            <p className="amount-label">1人あたりの支払額 (全員):</p>
            <p className="amount-result main-amount">
              <strong>¥{amountPerPerson.toLocaleString()}</strong>
            </p>
            <p className="note-text">
              ※10円単位で切り上げました。合計で¥{remainder.toLocaleString()}
              のお釣りが出ます。
            </p>
          </>
        ) : (
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
            <p className="note-text adjusted-note">
              ※代表者が端数 (¥
              {lastPersonAmount - baseAmount * (personCount - 1) > baseAmount
                ? lastPersonAmount - baseAmount * (personCount - 1) - baseAmount
                : 0}
              円) を調整します。
            </p>
          </>
        )}
      </div>

      {/* アクションボタン */}
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
