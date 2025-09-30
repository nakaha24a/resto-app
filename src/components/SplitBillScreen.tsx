// src/components/SplitBillScreen.tsx

import React, { useState, useMemo } from "react";

interface SplitBillScreenProps {
  totalAmount: number;
  onCallStaff: () => void;
  onBack: () => void; // 戻るボタンのハンドラ (ORDER画面へ)
}

// 端数処理のオプション型
type RoundingOption = "CEIL" | "NONE"; // CEIL: 切り上げ, NONE: 代表者調整

const SplitBillScreen: React.FC<SplitBillScreenProps> = ({
  totalAmount,
  onCallStaff,
  onBack,
}) => {
  const [personCount, setPersonCount] = useState<number>(2);
  // 初期値は一律切り上げ（CEIL）
  const [roundingOption, setRoundingOption] = useState<RoundingOption>("CEIL");

  // 1人あたりの金額と端数（お釣り）を計算するロジック
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
        // オプション1: 一律切り上げ
        finalAmount = Math.ceil(rawAmount);
        remainderCalc = finalAmount * personCount - totalAmount; // 浮いた金額 (余剰金)
        base = finalAmount;
        lastPerson = finalAmount;
      } else {
        // オプション2: 代表者調整
        base = Math.floor(rawAmount); // 他の全員が支払う額 (切り捨て)
        const paidByOthers = base * (personCount - 1);
        lastPerson = totalAmount - paidByOthers; // 代表者が支払う額

        finalAmount = base;
        remainderCalc = lastPerson - base; // 代表者が調整する額
      }

      return {
        amountPerPerson: finalAmount,
        remainder: remainderCalc,
        baseAmount: base,
        lastPersonAmount: lastPerson,
      };
    }, [totalAmount, personCount, roundingOption]);

  const handleCountChange = (change: number) => {
    // 人数は最低1人
    setPersonCount((prevCount) => Math.max(1, prevCount + change));
  };

  const handleCallForPayment = () => {
    // 店員呼び出しのロジックを実行
    onCallStaff();
    // TODO: Firestoreに会計依頼のステータスを書き込む処理
  };

  return (
    <div className="screen split-bill-screen">
      <div className="split-card">
        <h2>💸 割り勘計算シミュレーション</h2>

        <div className="summary-box">
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>合計金額:</p>
          <strong>¥{totalAmount.toLocaleString()}</strong>
        </div>

        {/* 割り勘人数コントロール */}
        <div className="split-control">
          <h3>👥 割り勘する人数</h3>
          <div className="person-counter">
            <button
              onClick={() => handleCountChange(-1)}
              disabled={personCount <= 1}
            >
              -
            </button>
            <span className="count-display">{personCount}</span>
            <button onClick={() => handleCountChange(1)}>+</button>
          </div>
        </div>

        {/* 端数処理オプション */}
        <div className="rounding-control">
          <h3>🧮 端数処理方法の選択</h3>
          <div className="rounding-options">
            <label>
              <input
                type="radio"
                name="rounding"
                value="CEIL"
                checked={roundingOption === "CEIL"}
                onChange={() => setRoundingOption("CEIL")}
              />
              <span>**一律切り上げ** (全員が同じ額を払い、後で調整)</span>
            </label>
            <label>
              <input
                type="radio"
                name="rounding"
                value="NONE"
                checked={roundingOption === "NONE"}
                onChange={() => setRoundingOption("NONE")}
              />
              <span>
                **代表者調整**
                (他の人は切り捨て額、代表者が端数を含む額を支払う)
              </span>
            </label>
          </div>
        </div>

        {/* 計算結果 */}
        <div className="result-box">
          <h3>支払目安額</h3>
          {roundingOption === "CEIL" ? (
            <>
              <p style={{ fontSize: "1.2rem" }}>1人あたりの支払額:</p>
              <p className="amount-result">
                <strong>¥{amountPerPerson.toLocaleString()}</strong>
              </p>
              {remainder > 0 && (
                <p
                  style={{
                    marginTop: "5px",
                    color: "#e74c3c",
                    fontWeight: "bold",
                  }}
                >
                  ※合計より¥{remainder.toLocaleString()}
                  多くお支払いいただきます。（余剰金）
                </p>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize: "1.2rem" }}>
                代表者以外の支払額 (人数: {personCount - 1}人):
              </p>
              <p className="amount-result">
                <strong>¥{baseAmount.toLocaleString()}</strong>
              </p>
              <p style={{ fontSize: "1.2rem", marginTop: "15px" }}>
                代表者の支払額 (1人):
              </p>
              <p
                className="amount-result"
                style={{ fontSize: "3.5em", color: "#c0392b" }}
              >
                <strong>¥{lastPersonAmount.toLocaleString()}</strong>
              </p>
              <p style={{ marginTop: "5px", color: "#34495e" }}>
                ※代表者が端数 (¥{remainder.toLocaleString()}) を調整します。
              </p>
            </>
          )}
        </div>

        {/* アクションボタン */}
        <div className="split-controls-footer">
          <button
            className="call-staff-button-large"
            onClick={handleCallForPayment}
          >
            <span role="img" aria-label="hand">
              ✋
            </span>{" "}
            会計依頼 (店員呼び出し)
          </button>
          <button className="back-button" onClick={onBack}>
            <span role="img" aria-label="back">
              ↩️
            </span>{" "}
            注文画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitBillScreen;
