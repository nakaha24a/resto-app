// src/App.tsx

import React, { useState } from "react";
// types.tsの型定義に 'TITLE' が含まれていることを確認してください
import { Order, Screen, OrderItem, CartItem } from "./types";

// componentsフォルダからのインポート
import TitleScreen from "./components/TitleScreen";
import OrderScreen from "./components/OrderScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import CompleteScreen from "./components/CompleteScreen";
// ★新しく SplitBillScreen をインポート（後ほど作成）
import SplitBillScreen from "./components/SplitBillScreen";

import "./components/styles.css";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("TITLE");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  // ★新しく会計金額の状態を追加
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const handleUpdateCart = (item: OrderItem, quantityChange: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityChange;
        if (newQuantity <= 0) {
          return prevCart.filter((cartItem) => cartItem.id !== item.id);
        }
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else if (quantityChange > 0) {
        return [...prevCart, { ...item, quantity: quantityChange }];
      }
      return prevCart;
    });
  };

  const handlePlaceOrder = (orderData: Order) => {
    const tabletId = "T-05";

    const finalOrder: Order = {
      ...orderData,
      tableNumber: tabletId,
    };

    console.log("Final Order with Tablet ID:", finalOrder);

    setCurrentOrder(finalOrder);
    setCart([]);
    setCurrentScreen("COMPLETE");
  };

  // ★店員呼び出しハンドラをシンプルに修正
  const handleCallStaff = () => {
    const tabletId = "T-05";
    console.log(`Staff called from ${tabletId}.`);
    alert(`スタッフを呼び出しています。すぐにお伺いします。`);
  };

  // ★会計機能の開始（合計金額を計算し、画面遷移）
  const handleGoToPayment = () => {
    const total = cart.reduce((t, item) => t + item.price * item.quantity, 0);
    setTotalAmount(total);
    setCurrentScreen("PAYMENT_OPTIONS"); // 新しい画面に遷移
  };

  // ★会計オプション画面から分割画面へ遷移
  const handleSplitBill = () => {
    setCurrentScreen("SPLIT_BILL");
  };

  const handleGoBackToTitle = () => {
    setCurrentOrder(null);
    setCurrentScreen("TITLE");
  };

  // 画面のレンダリング
  const renderScreen = () => {
    switch (currentScreen) {
      case "TITLE":
        return <TitleScreen onStart={() => setCurrentScreen("ORDER")} />;

      case "ORDER":
      case "CART":
        return (
          <OrderScreen
            cart={cart}
            onUpdateCart={handleUpdateCart}
            onGoToCheckout={() => setCurrentScreen("CHECKOUT")}
            // ★店員呼び出しのハンドラを渡す
            onCallStaff={handleCallStaff}
            // ★会計機能の開始ハンドラを渡す
            onGoToPayment={handleGoToPayment}
          />
        );

      case "CHECKOUT":
        return (
          <CheckoutScreen
            orderItems={cart}
            onPlaceOrder={handlePlaceOrder}
            onBackToOrder={() => setCurrentScreen("ORDER")}
          />
        );

      // ★新しい会計オプション画面
      case "PAYMENT_OPTIONS":
        return (
          <div className="screen payment-options-screen">
            <h2>会計オプション</h2>
            <p>
              合計金額:{" "}
              <strong style={{ fontSize: "1.5em" }}>¥{totalAmount}</strong>
            </p>
            <p>この金額をレジでお支払いください。</p>
            <div className="payment-controls">
              <button className="option-button" onClick={handleSplitBill}>
                均等に割り勘する
              </button>
              <button className="option-button" onClick={handleCallStaff}>
                会計を依頼する (スタッフ呼び出し)
              </button>
              <button
                className="back-button"
                onClick={() => setCurrentScreen("ORDER")}
              >
                注文に戻る
              </button>
            </div>
          </div>
        );

      // ★割り勘画面
      case "SPLIT_BILL":
        return (
          <SplitBillScreen
            totalAmount={totalAmount}
            onCallStaff={handleCallStaff}
            onBack={() => setCurrentScreen("PAYMENT_OPTIONS")}
          />
        );

      case "COMPLETE":
        return (
          <CompleteScreen
            order={currentOrder}
            status="注文受付済み"
            onGoBack={handleGoBackToTitle}
          />
        );

      default:
        return <TitleScreen onStart={() => setCurrentScreen("ORDER")} />;
    }
  };

  return <div className="app-container">{renderScreen()}</div>;
};

export default App;
