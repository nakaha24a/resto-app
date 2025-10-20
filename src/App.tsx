// src/App.tsx (再修正・完成版)

import React, { useState } from "react";
import useCartStore from "./store/cartStore";

// コンポーネントのインポート
import TitleScreen from "./components/TitleScreen";
import OrderScreen, { NavTab } from "./components/OrderScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import ThanksScreen from "./components/ThanksScreen";

import "./components/styles.css";

// 画面遷移の種類に決済完了画面を再度追加
type AppScreen = "TITLE" | "ORDER" | "SPLIT_BILL" | "COMPLETE_PAYMENT"; // ← 決済完了画面を復活

const TABLE_ID = "T-05";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TITLE");
  const [tableNumber] = useState<string>(TABLE_ID);
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER");

  const { cart, pendingOrderTotalAmount, clearCart, clearPendingOrders } =
    useCartStore();
  const [showOrderComplete, setShowOrderComplete] = useState(false);

  // 初画面に戻る処理
  const handleBackToTitle = () => {
    clearCart();
    clearPendingOrders();
    setCurrentScreen("TITLE");
  };

  // 注文履歴画面に戻る処理
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

  // ★★★ 修正点1: 会計依頼をしたら、決済完了画面に遷移させる ★★★
  const handleRequestPayment = (message: string) => {
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);
    // 注文とカート情報をクリア
    clearCart();
    clearPendingOrders();
    // 決済完了画面へ遷移
    setCurrentScreen("COMPLETE_PAYMENT");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "TITLE":
        return (
          <TitleScreen
            onStart={() => setCurrentScreen("ORDER")}
            tabletId={tableNumber}
          />
        );
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
      // ★★★ 修正点2: 決済完了画面の表示ロジックを復活 ★★★
      case "COMPLETE_PAYMENT":
        return <ThanksScreen onBackToTitle={handleBackToTitle} />;
      default:
        return (
          <TitleScreen
            onStart={() => setCurrentScreen("ORDER")}
            tabletId={TABLE_ID}
          />
        );
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
