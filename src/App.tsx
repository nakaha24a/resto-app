import React, { useState, useEffect } from "react";
// ★ fetchMenuData をストアから直接インポート
import useCartStore, { usePendingOrderTotalAmount } from "./store/cartStore";

// コンポーネントのインポート
import OrderScreen, { NavTab } from "./components/OrderScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import ThanksScreen from "./components/ThanksScreen";

import "./components/styles.css";

type AppScreen = "ORDER" | "SPLIT_BILL" | "COMPLETE_PAYMENT";
const TABLE_ID = "T-05";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("ORDER");
  const [tableNumber] = useState<string>(TABLE_ID);
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER"); // ★ fetchMenuData をストアから取得

  const { cart, clearCart, clearPendingOrders, fetchMenuData } = useCartStore();

  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );
  const pendingOrderTotalAmount = usePendingOrderTotalAmount(); // ★★★ 修正点 ★★★ // アプリ起動時に1回だけメニューデータを取得する

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]); // 依存配列に fetchMenuData を指定 // (中略: メッセージ自動消去の useEffect は変更なし)

  useEffect(() => {
    if (confirmationMessage) {
      const timer = setTimeout(() => {
        setConfirmationMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [confirmationMessage]); // (中略ここまで) // (中略: handleBackToTitle, handleBackToOrderHistory, handleNavigateOrderTab, handleGoToSplitBill, handleRequestPayment, handleCallStaff のロジックは変更なし)
  const handleBackToTitle = () => {
    clearCart();
    clearPendingOrders();
    setCurrentScreen("ORDER");
    setActiveOrderTab("ORDER");
  };

  const handleBackToOrderHistory = () => {
    setCurrentScreen("ORDER");
    setActiveOrderTab("HISTORY");
  };

  const handleNavigateOrderTab = (tab: NavTab) => setActiveOrderTab(tab);

  const handleGoToSplitBill = () => {
    if (pendingOrderTotalAmount === 0 && cart.length === 0) {
      setConfirmationMessage("商品がないため、お会計に進めません。");
      return;
    }
    setCurrentScreen("SPLIT_BILL");
  };

  const handleRequestPayment = (message: string) => {
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);
    clearCart();
    clearPendingOrders();
    setCurrentScreen("COMPLETE_PAYMENT");
  };

  const handleCallStaff = (message: string) => {
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);
    setConfirmationMessage(message);
  }; // (中略ここまで)
  const renderScreen = () => {
    switch (currentScreen) {
      case "ORDER":
        return (
          <OrderScreen
            userId={tableNumber}
            activeTab={activeOrderTab}
            onNavigate={handleNavigateOrderTab}
            onGoToPayment={handleGoToSplitBill}
            setConfirmationMessage={setConfirmationMessage}
            onCallStaff={handleCallStaff}
          />
        );
      case "SPLIT_BILL":
        return (
          <SplitBillScreen
            onCallStaff={handleRequestPayment}
            onBack={handleBackToOrderHistory}
          />
        );
      case "COMPLETE_PAYMENT":
        return <ThanksScreen onBackToTitle={handleBackToTitle} />;
      default:
        return (
          <OrderScreen
            userId={tableNumber}
            activeTab={activeOrderTab}
            onNavigate={handleNavigateOrderTab}
            onGoToPayment={handleGoToSplitBill}
            setConfirmationMessage={setConfirmationMessage}
            onCallStaff={handleCallStaff}
          />
        );
    }
  };

  return (
    <div className="app-container">
            {renderScreen()}     {" "}
      {/* (中略: confirmation-overlay の JSX は変更なし) */}     {" "}
      {confirmationMessage && (
        <div className="confirmation-overlay">
                   {" "}
          <div className="confirmation-box">
                        {confirmationMessage.includes("承り") ? "✅" : "✋"}    
                    {confirmationMessage}         {" "}
          </div>
                 {" "}
        </div>
      )}
         {" "}
    </div>
  );
};

export default App;
