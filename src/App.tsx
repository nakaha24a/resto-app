/* src/App.tsx */
import React, { useState, useEffect } from "react";
import useCartStore from "./store/cartStore";
import "./components/styles/variables.css";
import "./components/styles/layout.css";
import "./components/styles/components.css";

import OrderScreen, { NavTab } from "./components/OrderScreen";
import PaymentOptionsScreen from "./components/PaymentOptionsScreen";

// ★修正: THANKS を削除
type AppScreen = "TABLE_INPUT" | "ORDER" | "PAYMENT_OPTIONS";

const App: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [tableNum, setTableNum] = useState<number>(0);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TABLE_INPUT");

  // 初期値は "TOP"
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("TOP");

  const { clearCart, fetchMenuData, callStaff } = useCartStore();
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchMenuData();
    const queryParams = new URLSearchParams(window.location.search);
    const tableParam = queryParams.get("table");
    if (tableParam) {
      const num = parseInt(tableParam.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(num) && num > 0) {
        setUserId(`T-${num}`);
        setTableNum(num);
        setCurrentScreen("ORDER");
      }
    }
  }, [fetchMenuData]);

  useEffect(() => {
    if (confirmationMessage) {
      const timer = setTimeout(() => setConfirmationMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmationMessage]);

  const handleCallStaff = (message: string) => {
    setConfirmationMessage(message);
    callStaff(tableNum);
  };

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  // ★修正: 決済完了(=リセット)時の処理
  // PaymentOptionsScreen側でcheckout(データ消去)は実行済みなので、
  // ここでは「画面を最初の状態に戻す」だけでOKです。
  const handlePaymentComplete = () => {
    setConfirmationMessage("ありがとうございました");
    clearCart(); // 念のためローカルストアもクリア
    setTableNum(0); // テーブル番号リセット
    setUserId(""); // ユーザーIDリセット
    setActiveOrderTab("TOP"); // タブをTOPに戻す
    navigateTo("TABLE_INPUT"); // 最初(テーブル入力)に戻る
  };

  if (currentScreen === "TABLE_INPUT") {
    return (
      <div
        className="screen table-input-screen"
        style={{ padding: "40px", textAlign: "center" }}
      >
        <h2>いらっしゃいませ</h2>
        <p>テーブル番号を入力してください</p>
        <div style={{ margin: "20px 0" }}>
          <input
            type="number"
            min="1"
            placeholder="番号"
            style={{
              fontSize: "2rem",
              padding: "10px",
              width: "120px",
              textAlign: "center",
            }}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val < 1) {
                setTableNum(1);
              } else {
                setTableNum(val);
              }
            }}
            value={tableNum || ""}
          />
        </div>
        <button
          onClick={() => {
            if (tableNum > 0) {
              setUserId(`T-${tableNum}`);
              setActiveOrderTab("TOP");
              setCurrentScreen("ORDER");
            } else {
              alert("1以上の正しい番号を入力してください");
            }
          }}
          style={{
            padding: "15px 40px",
            fontSize: "1.2rem",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          注文を始める
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      {confirmationMessage && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">
            <p>{confirmationMessage}</p>
          </div>
        </div>
      )}

      {currentScreen === "ORDER" && (
        <OrderScreen
          userId={userId}
          activeTab={activeOrderTab}
          onNavigate={setActiveOrderTab}
          onGoToPayment={() => navigateTo("PAYMENT_OPTIONS")}
          setConfirmationMessage={setConfirmationMessage}
          onCallStaff={handleCallStaff}
        />
      )}

      {currentScreen === "PAYMENT_OPTIONS" && (
        <PaymentOptionsScreen
          onGoToSplitBill={() => navigateTo("PAYMENT_OPTIONS")}
          onCallStaff={handleCallStaff}
          onBack={() => navigateTo("ORDER")}
          onPaymentComplete={handlePaymentComplete}
          tableNumber={tableNum} // ★ここ重要: テーブル番号を渡す
        />
      )}

      {/* ★削除: ThanksScreen の分岐を完全に削除しました */}
    </div>
  );
};

export default App;
