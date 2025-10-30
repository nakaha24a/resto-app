// src/App.tsx

import React, { useState } from "react";
// ★ usePendingOrderTotalAmount をインポート
import useCartStore, { usePendingOrderTotalAmount } from "./store/cartStore";

// コンポーネントのインポート
import OrderScreen, { NavTab } from "./components/OrderScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import ThanksScreen from "./components/ThanksScreen";
// ★ PaymentOptionsScreen は使われていないようなのでコメントアウト (必要なら戻す)
// import PaymentOptionsScreen from "./components/PaymentOptionsScreen";

import "./components/styles.css";

// AppScreen 型定義 (変更なし)
type AppScreen = "ORDER" | "SPLIT_BILL" | "COMPLETE_PAYMENT";

const TABLE_ID = "T-05"; // 仮のテーブルID

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("ORDER");
  const [tableNumber] = useState<string>(TABLE_ID);
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER"); // OrderScreen 内のタブ状態

  // ★ clearPendingOrders をストアから取得
  const { cart, clearCart, clearPendingOrders } = useCartStore();
  const [showOrderComplete, setShowOrderComplete] = useState(false);
  // ★ pendingOrderTotalAmount をフックで取得
  const pendingOrderTotalAmount = usePendingOrderTotalAmount();

  // 決済完了後に OrderScreen に戻る処理
  const handleBackToTitle = () => {
    clearCart();
    clearPendingOrders(); // ★ ストアのアクションを呼び出す
    setCurrentScreen("ORDER");
    setActiveOrderTab("ORDER");
  };

  // SplitBillScreen から OrderScreen (履歴タブ) に戻る処理
  const handleBackToOrderHistory = () => {
    setCurrentScreen("ORDER");
    setActiveOrderTab("HISTORY");
  };

  // OrderScreen 内のタブ移動ハンドラ
  const handleNavigateOrderTab = (tab: NavTab) => setActiveOrderTab(tab);

  // 割り勘画面へ遷移する処理
  const handleGoToSplitBill = () => {
    // ★ カートが空でも未会計があれば進めるように修正
    if (pendingOrderTotalAmount === 0 && cart.length === 0) {
      alert("ご注文履歴またはカートに商品がないため、お会計に進めません。");
      return;
    }
    setCurrentScreen("SPLIT_BILL");
  };

  // 支払い依頼 (店員呼び出し) 処理
  const handleRequestPayment = (message: string) => {
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);
    // ★ 支払い完了後にカートと未会計注文をクリア
    clearCart();
    clearPendingOrders();
    setCurrentScreen("COMPLETE_PAYMENT"); // 完了画面へ
  };

  // 表示する画面を切り替える
  const renderScreen = () => {
    switch (currentScreen) {
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
            onBack={handleBackToOrderHistory} // 戻るボタンの遷移先
          />
        );
      case "COMPLETE_PAYMENT":
        return <ThanksScreen onBackToTitle={handleBackToTitle} />; // 完了画面から最初の画面へ
      default: // 想定外の Screen の場合は Order 画面に戻す
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
      {renderScreen()}
      {/* 注文完了時のオーバーレイ表示 */}
      {showOrderComplete && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">✅ ご注文を承りました</div>
        </div>
      )}
    </div>
  );
};

export default App;
