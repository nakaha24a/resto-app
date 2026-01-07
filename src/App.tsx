/* src/App.tsx */
import React, { useState, useEffect } from "react";
import useCartStore from "./store/cartStore";
import "./components/styles/variables.css";
import "./components/styles/layout.css";
import "./components/styles/components.css";

import OrderScreen, { NavTab } from "./components/OrderScreen";
import PaymentOptionsScreen from "./components/PaymentOptionsScreen";
import ThanksScreen from "./components/ThanksScreen";

type AppScreen = "TABLE_INPUT" | "ORDER" | "PAYMENT_OPTIONS" | "THANKS";

const App: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [tableNum, setTableNum] = useState<number>(0);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TABLE_INPUT");

  // ★修正: 初期値を "TOP" に変更（最初からトップ画面を表示）
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("TOP");

  const { clearCart, fetchMenuData, checkout } = useCartStore();
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
    useCartStore.getState().callStaff(tableNum);
  };

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  const handlePaymentComplete = async () => {
    if (tableNum > 0) {
      setConfirmationMessage("会計処理を実行中...");
      await checkout(tableNum);
    }
    // ここでカートクリアは checkout 内で行われるので不要だが念のため
    clearCart();
    navigateTo("THANKS");
  };

  // ★修正: Thanks画面から戻る時の処理
  const handleBackToTop = () => {
    // 画面をテーブル入力に戻す
    navigateTo("TABLE_INPUT");
    // ★重要: 次回の表示タブを「TOP」にリセットする
    setActiveOrderTab("TOP");
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
              // ★重要: 注文開始時にも念のためTOPにセット
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
        />
      )}

      {currentScreen === "THANKS" && (
        // ★修正: リセット処理を含んだ関数を渡す
        <ThanksScreen onBackToTop={handleBackToTop} />
      )}
    </div>
  );
};

export default App;
