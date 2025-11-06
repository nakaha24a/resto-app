// src/components/SplitBillScreen.tsx (修正後・シンプル版)

import React, { useState, useMemo } from "react";
// ★ usePendingOrderTotalAmount をインポート
import useCartStore, { usePendingOrderTotalAmount } from "../store/cartStore";

interface SplitBillScreenProps {
  onCallStaff: (message: string) => void;
  onBack: () => void;
}

// ★ 端数処理の型 (不要になったので削除)
// type RoundingOption = "CEIL" | "NONE";

const SplitBillScreen: React.FC<SplitBillScreenProps> = ({
  onCallStaff,
  onBack,
}) => {
  // ★ ストアから合計金額を取得
  const pendingOrderTotalAmount = usePendingOrderTotalAmount();

  const [personCount, setPersonCount] = useState<number>(2);
  // ★ 端数処理の選択 (不要になったので削除)
  // const [roundingOption, setRoundingOption] = useState<RoundingOption>("CEIL");

  // ★ 計算ロジックを「代表者が調整」に固定
  const { baseAmount, lastPersonAmount } = useMemo(() => {
    // ★ amountPerPerson と remainder を削除
    if (pendingOrderTotalAmount <= 0 || personCount <= 0) {
      return { baseAmount: 0, lastPersonAmount: 0 };
    }

    // ★ "代表者が調整" (NONE) のロジックだけを残す
    const rawAmount = pendingOrderTotalAmount / personCount;
    // 代表者以外の金額（10円単位で切り捨て）
    const base = Math.floor(rawAmount / 10) * 10;
    const totalOther = base * (personCount - 1);
    // 代表者の金額（残りの全額）
    const lastPerson = pendingOrderTotalAmount - totalOther;

    return {
      baseAmount: base,
      lastPersonAmount: lastPerson,
    };
  }, [pendingOrderTotalAmount, personCount]); // ★ roundingOption を依存配列から削除

  const handleCallForPayment = () => {
    // ★ メッセージをシンプルに
    const message = `会計依頼 (合計: ${pendingOrderTotalAmount.toLocaleString()}円 / 割り勘人数: ${personCount}人 / 1人が端数調整)`;
    onCallStaff(message);
  };

  const handleCountChange = (change: number) => {
    // ★ 人数の下限を1人に変更 (1人の場合も計算できるように)
    setPersonCount((prev) => Math.max(1, prev + change));
  };

  return (
    <div className="screen split-bill-screen">
      <h2 className="screen-title">🧑‍🤝‍🧑 お会計 (割り勘計算)</h2>

      <div className="split-controls">
        {/* 人数選択 (変更なし) */}
        <div className="control-group person-count-selector">
          <label>割り勘人数:</label>
          <div className="count-stepper">
            <button
              onClick={() => handleCountChange(-1)}
              disabled={personCount <= 1} // ★ 1人以下にはできない
            >
              ー
            </button>
            <span className="current-count">{personCount} 人</span>
            <button onClick={() => handleCountChange(1)}>＋</button>
          </div>
        </div>

        {/* ★↓ 端数処理の選択肢を削除 ↓★ */}
        {/*
        <div className="control-group rounding-options">
          <label>端数処理方法:</label>
          <div className="option-buttons">
             ... (ボタン) ...
          </div>
        </div>
        */}
        {/* ★↑ 端数処理の選択肢を削除 ↑★ */}
      </div>

      <div className="summary-section">
        <p className="total-display">
          全体の合計金額:{" "}
          <strong>¥{pendingOrderTotalAmount.toLocaleString()}</strong>
        </p>
      </div>

      <div className="calculation-result-box">
        <h3 className="result-title">計算結果</h3>

        {/* ★↓ 常に「代表者が調整」のロジックで表示 ↓★ */}
        {personCount === 1 ? (
          // ★ 1人の場合の表示
          <>
            <p className="amount-label">お支払い金額:</p>
            <p className="amount-result main-amount">
              <strong>¥{pendingOrderTotalAmount.toLocaleString()}</strong>
            </p>
          </>
        ) : (
          // ★ 2人以上の場合の表示
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
            {/* ★ 差額がある場合のみ注釈を表示 */}
            {lastPersonAmount - baseAmount !== 0 && (
              <p className="note-text adjusted-note">
                ※代表者が端数 (¥
                {(lastPersonAmount - baseAmount).toLocaleString()} 円)
                を調整します。
              </p>
            )}
          </>
        )}
        {/* ★↑ 表示ロジックの修正ここまで ↑★ */}
      </div>

      {/* アクションボタン (変更なし) */}
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
