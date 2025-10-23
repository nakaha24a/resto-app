// src/App.tsx (TitleScreenを完全に削除した最終版)

import React, { useState } from "react";
import useCartStore from "./store/cartStore";

// コンポーネントのインポート
// ★ TitleScreen の import を削除
import OrderScreen, { NavTab } from "./components/OrderScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import ThanksScreen from "./components/ThanksScreen";

import "./components/styles.css";

// ★ "TITLE" を AppScreen から削除
type AppScreen = "ORDER" | "SPLIT_BILL" | "COMPLETE_PAYMENT";

const TABLE_ID = "T-05";

const App: React.FC = () => {
  // ★ 初期値を "ORDER" に設定 (これは完了していますね)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("ORDER");
  const [tableNumber] = useState<string>(TABLE_ID);
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER");

  const { cart, pendingOrderTotalAmount, clearCart, clearPendingOrders } =
    useCartStore();
  const [showOrderComplete, setShowOrderComplete] = useState(false); // ★ handleBackToTitle は不要になるか、

  // 決済完了後に OrderScreen に戻るように変更（ここでは一旦残します）
  const handleBackToTitle = () => {
    clearCart();
    clearPendingOrders();
    // タイトルには戻れないので、ORDER に戻るか、アプリをリロードさせるなど
    // ここでは便宜上 "ORDER" に戻るようにしておきます
    setCurrentScreen("ORDER");
    setActiveOrderTab("ORDER");
  }; // 注文履歴画面に戻る処理

  const handleBackToOrderHistory = () => {
    setCurrentScreen("ORDER");
    setActiveOrderTab("HISTORY");
  };

  const handleNavigateOrderTab = (tab: NavTab) => setActiveOrderTab(tab);

  const handleGoToSplitBill = () => {
    if (pendingOrderTotalAmount === 0 && cart.length === 0) {
      alert("ご注文履歴がないため、お会計に進めません。");
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

  const renderScreen = () => {
    switch (currentScreen) {
      // ★ case "TITLE": を完全に削除

      case "ORDER":
        return (
          <OrderScreen
            userId={tableNumber}
            activeTab={activeOrderTab}
            onNavigate={handleNavigateOrderTab}
            onGoToPayment={handleGoToSplitBill}
            setShowOrderComplete={setShowOrderComplete}
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
      // ★ default: も "ORDER" に変更
      default:
        return (
          <OrderScreen
            userId={tableNumber}
            activeTab={activeOrderTab}
            onNavigate={handleNavigateOrderTab}
            onGoToPayment={handleGoToSplitBill}
            setShowOrderComplete={setShowOrderComplete}
          />
        );
    }
  };

  return (
    <div className="app-container">
            {renderScreen()}     {" "}
      {showOrderComplete && (
        <div className="confirmation-overlay">
                   {" "}
          <div className="confirmation-box">✅ ご注文を承りました</div>       {" "}
        </div>
      )}
         {" "}
    </div>
  );
};

export default App;
