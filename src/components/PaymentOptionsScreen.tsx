import React, { useState, useMemo, useEffect } from "react";
import useCartStore, { useTotalBillAmount } from "../store/cartStore";

interface PaymentOptionsScreenProps {
  onGoToSplitBill: () => void;
  onCallStaff: (message: string) => void;
  onBack: () => void;
  onPaymentComplete: () => void;
  tableNumber?: number;
}

const PaymentOptionsScreen: React.FC<PaymentOptionsScreenProps> = ({
  onBack,
  onPaymentComplete,
  tableNumber = 1,
}) => {
  const totalAmount = useTotalBillAmount();
  const checkout = useCartStore((state) => state.checkout);
  const fetchOrders = useCartStore((state) => state.fetchOrders);

  const [peopleCount, setPeopleCount] = useState(2);
  // 案内画面（レジ誘導）を表示するフラグ
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (tableNumber) fetchOrders(tableNumber);
  }, [tableNumber, fetchOrders]);

  // 割り勘計算
  const splitResult = useMemo(() => {
    if (peopleCount <= 0 || totalAmount <= 0) {
      return { head: 0, others: 0, hasRemainder: false };
    }
    const baseAmount = Math.floor(totalAmount / peopleCount);
    const remainder = totalAmount % peopleCount;

    return {
      head: baseAmount + remainder,
      others: baseAmount,
      hasRemainder: remainder > 0,
    };
  }, [totalAmount, peopleCount]);

  const handleCountChange = (delta: number) => {
    setPeopleCount((prev) => Math.max(1, Math.min(99, prev + delta)));
  };

  // 「レジへ進む」ボタン → 案内画面へ切り替え
  const handleGoToRegister = () => {
    setShowGuide(true);
  };

  // トップへ戻る（ここで初めてデータをリセット）
  const handleFinalReset = async () => {
    try {
      await checkout(tableNumber); // データ消去
      onPaymentComplete(); // トップ画面へ遷移
    } catch (error) {
      alert("処理に失敗しました");
    }
  };

  return (
    <>
      <style>{`
        .simple-screen {
          display: flex;
          height: 100vh;
          background-color: #f8f9fa;
          font-family: sans-serif;
          overflow: hidden;
        }

        /* 左パネル */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
          border-right: 1px solid #e0e0e0;
        }

        .total-box { text-align: center; margin-bottom: 50px; }
        .total-label { color: #666; font-size: 1.2rem; margin-bottom: 10px; }
        .total-price { color: #333; font-size: 4.5rem; font-weight: bold; margin: 0; line-height: 1; }

        .counter-box {
          background: white; padding: 30px; border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          width: 100%; max-width: 400px; text-align: center;
        }
        .counter-controls {
          display: flex; justify-content: space-between; align-items: center; margin-top: 20px;
        }
        .count-btn {
          width: 70px; height: 70px; font-size: 2rem; background: #fff;
          border: 2px solid #ddd; border-radius: 12px; cursor: pointer; color: #555;
        }
        .count-btn:active { background-color: #eee; }
        .count-display { font-size: 3rem; font-weight: bold; color: #333; }

        /* 右パネル */
        .right-panel {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 40px; background-color: white;
        }

        .result-box {
          width: 100%; max-width: 450px; padding: 30px;
          border-radius: 20px; margin-bottom: 40px; text-align: center;
        }
        .result-box.equal { background-color: #ecfdf5; border: 2px solid #10b981; }
        .equal-price { font-size: 4.5rem; font-weight: bold; color: #059669; margin: 0; }
        
        .result-box.unequal { background-color: #fff7ed; border: 2px solid #f97316; }
        .unequal-row {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px dashed #ccc; padding: 15px 0;
        }
        .unequal-row:last-child { border-bottom: none; }
        .u-label { font-size: 1.2rem; color: #555; }
        .u-price { font-size: 2rem; font-weight: bold; }
        .head-price { color: #ea580c; }
        .others-price { color: #059669; }

        .btn-area { width: 100%; max-width: 450px; display: flex; flex-direction: column; gap: 15px; }
        
        .register-btn {
          width: 100%; padding: 20px; font-size: 1.5rem; font-weight: bold; color: white;
          background-color: #f97316; border: none; border-radius: 50px; cursor: pointer;
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
        }
        .register-btn:active { transform: translateY(2px); }

        .back-btn {
          width: 100%; padding: 15px; font-size: 1.1rem; font-weight: bold; color: #666;
          background: transparent; border: 2px solid #ccc; border-radius: 50px; cursor: pointer;
        }

        /* ========= 案内画面（Guide）スタイル ========= */
        .guide-container {
          width: 100%; height: 100vh;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          background-color: #fff;
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .guide-icon { font-size: 6rem; margin-bottom: 20px; }
        
        .guide-message-box {
          font-size: 1.4rem; color: #444; text-align: center;
          line-height: 1.8; margin-bottom: 50px; 
          border: 4px solid #f97316; /* オレンジ枠で注意喚起 */
          padding: 40px; border-radius: 20px; background-color: #fff7ed;
          max-width: 600px; width: 90%;
        }
        .guide-message-box strong {
          color: #ea580c; font-size: 1.8rem; display: block; margin: 10px 0;
        }
        
        .reset-btn {
          padding: 20px 50px; font-size: 1.3rem; font-weight: bold; color: white;
          background-color: #2563eb; border: none; border-radius: 50px; cursor: pointer;
          box-shadow: 0 5px 15px rgba(37, 99, 235, 0.4);
        }
      `}</style>

      {/* ★画面の切り替え */}
      {showGuide ? (
        // ========= レジ誘導・案内画面（完了画面の代わり） =========
        <div className="guide-container">
          <div className="guide-icon">🧾</div>

          <div className="guide-message-box">
            <p>この画面のまま、</p>
            <strong>
              伝票を持って
              <br />
              レジへお越しください
            </strong>
            <p style={{ fontSize: "1rem", color: "#666", marginTop: "20px" }}>
              （お支払いはレジにて承ります）
            </p>
          </div>

          <button className="reset-btn" onClick={handleFinalReset}>
            トップ画面へ戻る
          </button>
        </div>
      ) : (
        // ========= 割り勘計算画面 =========
        <div className="simple-screen">
          {/* 左パネル */}
          <div className="left-panel">
            <div className="total-box">
              <div className="total-label">お支払い合計</div>
              <div className="total-price">¥{totalAmount.toLocaleString()}</div>
            </div>

            <div className="counter-box">
              <div className="total-label">割り勘人数</div>
              <div className="counter-controls">
                <button
                  className="count-btn"
                  onClick={() => handleCountChange(-1)}
                >
                  -
                </button>
                <div className="count-display">
                  {peopleCount}
                  <span style={{ fontSize: "1.5rem" }}>名</span>
                </div>
                <button
                  className="count-btn"
                  onClick={() => handleCountChange(1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 右パネル */}
          <div className="right-panel">
            <div
              className={`result-box ${
                splitResult.hasRemainder ? "unequal" : "equal"
              }`}
            >
              {!splitResult.hasRemainder ? (
                <>
                  <div className="total-label" style={{ color: "#059669" }}>
                    1人あたりの金額
                  </div>
                  <div className="equal-price">
                    ¥{splitResult.others.toLocaleString()}
                  </div>
                  <div style={{ marginTop: "10px", color: "#666" }}>
                    全員同じ金額です
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: "#c2410c",
                      marginBottom: "15px",
                    }}
                  >
                    ⚠️ 端数が出ました
                  </div>
                  <div className="unequal-row">
                    <span className="u-label">幹事様 (1名)</span>
                    <span className="u-price head-price">
                      ¥{splitResult.head.toLocaleString()}
                    </span>
                  </div>
                  <div className="unequal-row">
                    <span className="u-label">
                      他の方 ({peopleCount - 1}名)
                    </span>
                    <span className="u-price others-price">
                      ¥{splitResult.others.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="btn-area">
              <button className="register-btn" onClick={handleGoToRegister}>
                ごちそうさま（レジへ進む）
              </button>
              <button className="back-btn" onClick={onBack}>
                メニューに戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentOptionsScreen;
