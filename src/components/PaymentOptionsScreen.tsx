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
  const [showGuide, setShowGuide] = useState(false);

  // ★修正ポイント: 画面が表示されるたびに状態をリセットする
  useEffect(() => {
    setShowGuide(false); // 案内画面をOFFに戻す
    setPeopleCount(2); // 人数もリセット
    if (tableNumber) fetchOrders(tableNumber);
  }, [tableNumber, fetchOrders]);

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

  const handleGoToRegister = () => {
    setShowGuide(true);
  };

  const handleFinalReset = async () => {
    try {
      await checkout(tableNumber);
      setShowGuide(false); // ★念のためここでもOFFにする
      onPaymentComplete();
    } catch (error) {
      alert("処理に失敗しました");
    }
  };

  return (
    <>
      <style>{`
        /* 全体のコンテナ */
        .simple-screen {
          display: flex;
          height: 100vh;
          background-color: #f8f9fa;
          font-family: sans-serif;
        }

        /* 共通パネルスタイル（スクロール対応） */
        .scrollable-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          /* 中身が少なくても中央寄せ、多くなったら上から並べる */
          justify-content: center; 
          padding: 20px;
          overflow-y: auto; /* 縦スクロールを許可 */
          height: 100%;
          box-sizing: border-box;
        }

        /* 左パネル */
        .left-panel {
          border-right: 1px solid #e0e0e0;
        }

        /* 右パネル */
        .right-panel {
          background-color: white;
        }

        .total-box { 
          text-align: center; 
          margin-bottom: 30px; 
        }
        .total-label { 
          color: #666; 
          font-size: 1.1rem; 
          margin-bottom: 5px; 
        }
        .total-price { 
          color: #333; 
          font-size: 3.5rem; 
          font-weight: bold; 
          margin: 0; 
          line-height: 1.1; 
        }

        .counter-box {
          background: white; 
          padding: 25px; 
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          width: 100%; 
          max-width: 350px; 
          text-align: center;
        }
        .counter-controls {
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-top: 15px;
        }
        .count-btn {
          width: 60px; 
          height: 60px; 
          font-size: 1.8rem; 
          background: #fff;
          border: 2px solid #ddd; 
          border-radius: 12px; 
          cursor: pointer; 
          color: #555;
          touch-action: manipulation;
        }
        .count-btn:active { background-color: #eee; }
        .count-display { 
          font-size: 2.5rem; 
          font-weight: bold; 
          color: #333; 
        }

        /* 結果ボックス */
        .result-box {
          width: 100%; 
          max-width: 400px; 
          padding: 25px;
          border-radius: 20px; 
          margin-bottom: 30px; 
          text-align: center;
        }
        .result-box.equal { background-color: #ecfdf5; border: 2px solid #10b981; }
        .equal-price { 
          font-size: 3.5rem; 
          font-weight: bold; 
          color: #059669; 
          margin: 0; 
        }
        
        .result-box.unequal { background-color: #fff7ed; border: 2px solid #f97316; }
        .unequal-row {
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          border-bottom: 1px dashed #ccc; 
          padding: 10px 0;
        }
        .unequal-row:last-child { border-bottom: none; }
        .u-label { font-size: 1.1rem; color: #555; }
        .u-price { font-size: 1.8rem; font-weight: bold; }
        .head-price { color: #ea580c; }
        .others-price { color: #059669; }

        .btn-area { 
          width: 100%; 
          max-width: 400px; 
          display: flex; 
          flex-direction: column; 
          gap: 15px; 
          padding-bottom: 20px;
        }
        
        .register-btn {
          width: 100%; 
          padding: 20px; 
          font-size: 1.3rem; 
          font-weight: bold; 
          color: white;
          background-color: #f97316; 
          border: none; 
          border-radius: 50px; 
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
        }
        .register-btn:active { transform: translateY(2px); }

        .back-btn {
          width: 100%; 
          padding: 15px; 
          font-size: 1.1rem; 
          font-weight: bold; 
          color: #666;
          background: transparent; 
          border: 2px solid #ccc; 
          border-radius: 50px; 
          cursor: pointer;
        }

        /* ========= 案内画面（Guide）スタイル ========= */
        .guide-container {
          width: 100%; 
          height: 100vh;
          display: flex; 
          flex-direction: column;
          justify-content: center; 
          align-items: center;
          background-color: #fff;
          animation: fadeIn 0.5s ease-out;
          overflow-y: auto;
          padding: 20px;
          box-sizing: border-box;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .thanks-header {
          font-size: 2.2rem; 
          font-weight: 900; 
          color: #333;
          margin-bottom: 10px; 
          text-align: center;
        }
        .thanks-sub {
          font-size: 1.1rem; 
          color: #666; 
          margin-bottom: 30px;
        }

        .guide-icon { font-size: 4rem; margin-bottom: 15px; }
        
        .guide-message-box {
          font-size: 1.3rem; 
          color: #444; 
          text-align: center;
          line-height: 1.6; 
          margin-bottom: 40px; 
          border: 4px solid #f97316;
          padding: 30px; 
          border-radius: 20px; 
          background-color: #fff7ed;
          max-width: 500px; 
          width: 90%;
        }
        .guide-message-box strong {
          color: #ea580c; 
          font-size: 1.6rem; 
          display: block; 
          margin: 10px 0;
        }
        
        .reset-btn {
          padding: 18px 40px; 
          font-size: 1.2rem; 
          font-weight: bold; 
          color: white;
          background-color: #2563eb; 
          border: none; 
          border-radius: 50px; 
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(37, 99, 235, 0.4);
          margin-bottom: 20px;
        }
      `}</style>

      {showGuide ? (
        // ========= レジ誘導・案内画面 =========
        <div className="guide-container">
          <div className="thanks-header">ご利用ありがとうございました</div>
          <div className="thanks-sub">またのご来店をお待ちしております</div>

          <div className="guide-icon">🧾</div>

          <div className="guide-message-box">
            <p>この画面のまま、</p>
            <strong>
              伝票を持って
              <br />
              レジへお越しください
            </strong>
            <p style={{ fontSize: "1rem", color: "#666", marginTop: "15px" }}>
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
          {/* 左パネル (スクロール可) */}
          <div className="scrollable-panel left-panel">
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
                  <span style={{ fontSize: "1.2rem" }}>名</span>
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

          {/* 右パネル (スクロール可) */}
          <div className="scrollable-panel right-panel">
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
                      fontSize: "1.2rem",
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
