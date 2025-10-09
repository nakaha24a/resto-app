// src/App.tsx (最終修正版)

import React, { useState, useMemo } from "react";
import { MenuItem, CartItem, Order, OrderItem, Option } from "./types";
import { MOCK_MENU } from "./data/menu";

// コンポーネントのインポート
import TitleScreen from "./components/TitleScreen";
import OrderScreen, { NavTab } from "./components/OrderScreen";
import PaymentOptionsScreen from "./components/PaymentOptionsScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import ThanksScreen from "./components/ThanksScreen";

import "./components/styles.css";

// AppScreen型から'CHECKOUT'と'COMPLETE_ORDER'を削除
type AppScreen =
  | "TITLE"
  | "ORDER"
  | "PAYMENT_OPTIONS"
  | "SPLIT_BILL"
  | "COMPLETE_PAYMENT";

const TABLE_ID = "T-05";

const App: React.FC = () => {
  // --- State管理 ---
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TITLE");
  const [tableNumber] = useState<string>(TABLE_ID);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(
    null
  );
  const [showOrderComplete, setShowOrderComplete] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER");

  // --- 計算値 ---
  const cartTotalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const pendingOrderTotalAmount = useMemo(() => {
    return pendingOrders.reduce(
      (orderTotal, order) => orderTotal + order.totalAmount,
      0
    );
  }, [pendingOrders]);

  // --- 画面遷移ハンドラ ---
  const handleStart = () => setCurrentScreen("ORDER");
  const handleBackToOrderMenu = () => {
    setCurrentScreen("ORDER");
    setActiveOrderTab("ORDER");
  };
  const handleBackToOrderHistory = () => {
    setCurrentScreen("ORDER");
    setActiveOrderTab("HISTORY");
  };
  const handleBackToTitle = () => {
    setCart([]);
    setPendingOrders([]);
    setLastCompletedOrder(null);
    setCurrentScreen("TITLE");
  };
  const handleNavigateOrderTab = (tab: NavTab) => setActiveOrderTab(tab);

  // --- 注文ロジック ---
  const handleUpdateCart = (
    menuItemId: string,
    quantity: number,
    selectedOptions: Option[] = []
  ) => {
    const menuItem = MOCK_MENU.find((m) => m.id === menuItemId);
    if (!menuItem) return;

    const optionsId = selectedOptions
      .map((opt) => opt.name)
      .sort()
      .join("-");
    const cartItemId = `${menuItemId}-${optionsId}`;
    const existingItem = cart.find((item) => item.id === cartItemId);

    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    } else if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    } else {
      const optionsPrice = selectedOptions.reduce(
        (total, opt) => total + opt.price,
        0
      );
      const newCartItem: CartItem = {
        id: cartItemId,
        menuItemId,
        name: menuItem.name,
        price: menuItem.price + optionsPrice,
        quantity: quantity,
        selectedOptions,
      };
      setCart((prev) => [...prev, newCartItem]);
    }
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("カートに商品がありません。");
      return;
    }
    const orderItems: OrderItem[] = cart.map((cartItem) => {
      const menuItem = MOCK_MENU.find((m) => m.id === cartItem.menuItemId)!;
      return {
        ...menuItem,
        price: cartItem.price,
        quantity: cartItem.quantity,
        selectedOptions: cartItem.selectedOptions,
      };
    });

    const newOrder: Order = {
      id: `O${Date.now()}`,
      tableNumber: tableNumber,
      items: orderItems,
      totalAmount: cartTotalAmount,
      timestamp: Date.now(),
    };

    setPendingOrders((prev) => [...prev, newOrder]);
    setCart([]);
    setLastCompletedOrder(newOrder); // 履歴用に保存

    // メッセージを2.5秒間表示
    setShowOrderComplete(true);
    setTimeout(() => {
      setShowOrderComplete(false);
    }, 2500);
  };

  // --- 会計・スタッフ呼び出しロジック ---
  const handleGoToPaymentOptions = () => {
    if (pendingOrderTotalAmount === 0) {
      alert("確定済みのご注文がないため、お会計に進めません。");
      return;
    }
    setCurrentScreen("PAYMENT_OPTIONS");
  };
  const handleGoToSplitBill = () => setCurrentScreen("SPLIT_BILL");
  const handleCallStaff = () => alert("スタッフを呼び出しました。");
  const handleRequestPayment = (message: string) => {
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);
    setLastCompletedOrder({
      id: `P${Date.now()}`,
      tableNumber: tableNumber,
      items: [],
      totalAmount: pendingOrderTotalAmount,
      timestamp: Date.now(),
    });
    setPendingOrders([]);
    setCart([]);
    setCurrentScreen("COMPLETE_PAYMENT");
  };

  // --- 画面レンダリング ---
  const renderScreen = () => {
    switch (currentScreen) {
      case "TITLE":
        return <TitleScreen onStart={handleStart} tabletId={tableNumber} />;
      case "ORDER":
        return (
          <OrderScreen
            userId={tableNumber}
            menuItems={MOCK_MENU}
            cart={cart}
            totalAmount={cartTotalAmount}
            onUpdateCart={handleUpdateCart}
            onPlaceOrder={handlePlaceOrder}
            onCallStaff={handleCallStaff}
            onGoToPayment={handleGoToPaymentOptions}
            onNavigate={handleNavigateOrderTab}
            activeTab={activeOrderTab}
            pendingOrderCount={pendingOrders.length}
            pendingOrders={pendingOrders}
            pendingOrderTotalAmount={pendingOrderTotalAmount}
          />
        );
      case "PAYMENT_OPTIONS":
        return (
          <PaymentOptionsScreen
            totalAmount={pendingOrderTotalAmount}
            onGoToSplitBill={handleGoToSplitBill}
            onCallStaff={handleRequestPayment}
            onBack={handleBackToOrderHistory}
          />
        );
      case "SPLIT_BILL":
        return (
          <SplitBillScreen
            totalAmount={pendingOrderTotalAmount}
            onCallStaff={handleRequestPayment}
            onBack={handleGoToPaymentOptions}
          />
        );
      case "COMPLETE_PAYMENT":
        return <ThanksScreen onBackToTitle={handleBackToTitle} />;
      default:
        // 通常ここには来ませんが、フォールバックとしてTitleScreenを表示
        return <TitleScreen onStart={handleStart} tabletId={TABLE_ID} />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
      {/* 注文完了メッセージの表示 */}
      {showOrderComplete && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">✅ ご注文を承りました</div>
        </div>
      )}
    </div>
  );
};

export default App;
