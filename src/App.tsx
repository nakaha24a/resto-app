// src/App.tsx (最終修正・完成版)

import React, { useState } from "react";
import useCartStore from "./store/cartStore";

// コンポーネントのインポート
import TitleScreen from "./components/TitleScreen";
import OrderScreen, { NavTab } from "./components/OrderScreen";
import PaymentOptionsScreen from "./components/PaymentOptionsScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import ThanksScreen from "./components/ThanksScreen";

import "./components/styles.css";

type AppScreen =
  | "TITLE"
  | "ORDER"
  | "PAYMENT_OPTIONS"
  | "SPLIT_BILL"
  | "COMPLETE_PAYMENT";

const TABLE_ID = "T-05";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TITLE");
  const [tableNumber] = useState<string>(TABLE_ID);
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER");

  const { pendingOrderTotalAmount, clearCart, clearPendingOrders } =
    useCartStore();
  const [showOrderComplete, setShowOrderComplete] = useState(false);

  const handleStart = () => setCurrentScreen("ORDER");
  const handleBackToOrderHistory = () => {
    setCurrentScreen("ORDER");
    setActiveOrderTab("HISTORY");
  };
  const handleBackToTitle = () => {
    clearCart();
    clearPendingOrders();
    setCurrentScreen("TITLE");
  };
  const handleNavigateOrderTab = (tab: NavTab) => setActiveOrderTab(tab);

  const handleGoToPaymentOptions = () => {
    if (pendingOrderTotalAmount === 0) {
      alert("ご注文履歴がないため、お会計に進めません。");
      return;
    }
    setCurrentScreen("PAYMENT_OPTIONS");
  };

  const handleGoToSplitBill = () => setCurrentScreen("SPLIT_BILL");

  const handleRequestPayment = (message: string) => {
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);
    clearCart();
    clearPendingOrders();
    setCurrentScreen("COMPLETE_PAYMENT");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "TITLE":
        return <TitleScreen onStart={handleStart} tabletId={tableNumber} />;
      case "ORDER":
        return (
          <OrderScreen
            userId={tableNumber}
            activeTab={activeOrderTab}
            onNavigate={handleNavigateOrderTab}
            onGoToPayment={handleGoToPaymentOptions}
            setShowOrderComplete={setShowOrderComplete}
          />
        );
      case "PAYMENT_OPTIONS":
        return (
          <PaymentOptionsScreen
            onGoToSplitBill={handleGoToSplitBill}
            onCallStaff={handleRequestPayment}
            onBack={handleBackToOrderHistory}
          />
        );
      case "SPLIT_BILL":
        return (
          <SplitBillScreen
            onCallStaff={handleRequestPayment}
            onBack={handleGoToPaymentOptions}
          />
        );
      case "COMPLETE_PAYMENT":
        return <ThanksScreen onBackToTitle={handleBackToTitle} />;
      default:
        return <TitleScreen onStart={handleStart} tabletId={TABLE_ID} />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
      {showOrderComplete && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">✅ ご注文を承りました</div>
        </div>
      )}
    </div>
  );
};

export default App;
