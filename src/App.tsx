import React, { useState, useEffect } from "react";
import useCartStore from "./store/cartStore";
import "./components/styles.css";
// SplitBillScreen は使用しない
import OrderScreen, { NavTab } from "./components/OrderScreen";
import PaymentOptionsScreen from "./components/PaymentOptionsScreen";
import ThanksScreen from "./components/ThanksScreen";

// ★ AppScreen から SPLIT_BILL を削除
type AppScreen = "TABLE_INPUT" | "ORDER" | "PAYMENT_OPTIONS" | "THANKS";

const App: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [tableNum, setTableNum] = useState<number>(0);

  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TABLE_INPUT");
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER");

  // clearPendingOrders は cartStore で復活させたのでエラーは消えるはずです
  const { clearCart, fetchMenuData, checkout } = useCartStore();

  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );

  // アプリ起動時の処理
  useEffect(() => {
    fetchMenuData();

    // URLパラメータがあればそれを使う (?table=5)
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

  // メッセージ消去タイマー
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

  // ★ 支払い完了時の処理: サーバー上の注文を会計済みにして、Thanks画面へ遷移
  const handlePaymentComplete = async () => {
    if (tableNum > 0) {
      setConfirmationMessage("会計処理を実行中...");
      await checkout(tableNum);
    }
    clearCart();
    navigateTo("THANKS");
  };

  // テーブル番号入力画面
  if (currentScreen === "TABLE_INPUT") {
    return (
      <div
        className="screen table-input-screen"
        style={{ padding: "40px", textAlign: "center" }}
      >
        <h2>いらっしゃいませ</h2>
        <p>テーブル番号を入力してください</p>
        <input
          type="number"
          style={{
            fontSize: "2rem",
            padding: "10px",
            width: "100px",
            textAlign: "center",
          }}
          onChange={(e) => setTableNum(parseInt(e.target.value, 10) || 0)}
        />
        <br />
        <br />
        <button
          onClick={() => {
            if (tableNum > 0) {
              setUserId(`T-${tableNum}`);
              setCurrentScreen("ORDER");
            } else {
              alert("正しい番号を入力してください");
            }
          }}
          style={{
            padding: "15px 30px",
            fontSize: "1.2rem",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "8px",
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
          onGoToSplitBill={() => navigateTo("PAYMENT_OPTIONS")} // SplitBillScreenを削除
          onCallStaff={handleCallStaff}
          onBack={() => navigateTo("ORDER")}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* SplitBillScreen の Route を削除 */}

      {currentScreen === "THANKS" && (
        <ThanksScreen onBackToTop={() => navigateTo("TABLE_INPUT")} />
      )}
    </div>
  );
};

export default App;
