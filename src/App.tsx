import React, { useState, useEffect } from "react";
import useCartStore from "./store/cartStore";
import "./components/styles.css";
// SplitBillScreen は削除
import OrderScreen, { NavTab } from "./components/OrderScreen";
import PaymentOptionsScreen from "./components/PaymentOptionsScreen";
import ThanksScreen from "./components/ThanksScreen";

type AppScreen = "TABLE_INPUT" | "ORDER" | "PAYMENT_OPTIONS" | "THANKS";

const App: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [tableNum, setTableNum] = useState<number>(0); // 初期値0だが、入力画面では1以上を強制する

  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TABLE_INPUT");
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER");

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
    clearCart();
    navigateTo("THANKS");
  };

  // ★ テーブル番号入力画面の修正
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
            min="1" // ★ 1未満入力を防ぐHTML属性
            placeholder="番号"
            style={{
              fontSize: "2rem",
              padding: "10px",
              width: "120px",
              textAlign: "center",
            }}
            // ★ 1未満になったら強制的に1に戻すか、空にする制御
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val < 1) {
                setTableNum(1);
              } else {
                setTableNum(val);
              }
            }}
            value={tableNum || ""} // 0のときは空表示にしてプレースホルダーを見せる
          />
        </div>
        <button
          onClick={() => {
            if (tableNum > 0) {
              setUserId(`T-${tableNum}`);
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
        <ThanksScreen onBackToTop={() => navigateTo("TABLE_INPUT")} />
      )}
    </div>
  );
};

export default App;
