import React, { useState } from "react";
import PartyInputScreen from "./components/PartyInputScreen";
import OrderScreen from "./components/OrderScreen";
import CartScreen from "./components/CartScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import PaymentScreen from "./components/PaymentScreen";
import CompleteScreen from "./components/CompleteScreen";
import { Member, CartItem, Order } from "./types";
import "./components/styles.css";

// 画面の種類を定義する型
type Screen =
  | "partyInput"
  | "order"
  | "cart"
  | "splitBill"
  | "payment"
  | "complete";
// 注文状況を定義する型
type OrderStatus = "注文受付済み" | "調理中" | "準備完了" | "お渡し済み";

const App: React.FC = () => {
  // アプリケーションの状態を管理
  const [currentScreen, setCurrentScreen] = useState<Screen>("partyInput");
  const [members, setMembers] = useState<Member[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("注文受付済み");

  // 参加者入力画面から注文画面へ遷移する
  const handleStartOrder = (finalizedMembers: Member[]) => {
    setMembers(finalizedMembers);
    setCurrentScreen("order");
  };

  // カートの内容を更新する
  const handleUpdateCart = (newCart: CartItem[]) => {
    setCart(newCart);
  };

  // 注文画面からカート画面へ
  const handleGoToCart = () => {
    setCurrentScreen("cart");
  };

  // 注文画面からカート画面へ
  const handleBackToOrder = () => {
    setCurrentScreen("order");
  };

  // カート画面から割り勘画面へ
  const handleGoToSplitBill = () => {
    setCurrentScreen("splitBill");
  };

  // 割り勘画面から支払い方法選択画面へ
  const handleGoToPayment = () => {
    setCurrentScreen("payment");
  };

  // 支払い方法選択画面から注文完了画面へ
  const handleCompleteOrder = () => {
    const newOrder: Order = {
      id: Date.now(),
      members: members,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      timestamp: new Date().toISOString(),
    };
    setOrder(newOrder);
    setCurrentScreen("complete");

    // 注文状況を段階的に更新（シミュレーション）
    setTimeout(() => {
      setOrderStatus("調理中");
    }, 3000);
    setTimeout(() => {
      setOrderStatus("準備完了");
    }, 10000);
  };

  const handleBackToPartyInput = () => {
    setCurrentScreen("partyInput");
  };

  return (
    <div className="app-container">
      {/* 画面の表示を制御 */}
      {currentScreen === "partyInput" && (
        <PartyInputScreen onStartOrder={handleStartOrder} />
      )}
      {currentScreen === "order" && (
        <OrderScreen
          members={members}
          cart={cart}
          onUpdateCart={handleUpdateCart}
          onGoToCheckout={handleGoToCheckout}
          onBackToPartyInput={handleBackToPartyInput}
        />
      )}
      {currentScreen === "cart" && (
        <CartScreen
          cart={cart}
          members={members}
          onUpdateCart={handleUpdateCart}
          onBackToOrder={handleBackToOrder}
          onGoToSplitBill={handleGoToSplitBill}
        />
      )}
      {currentScreen === "splitBill" && (
        <SplitBillScreen
          onBackToCart={handleBackToCart}
          onGoToPayment={handleGoToPayment}
        />
      )}
      {currentScreen === "payment" && (
        <PaymentScreen
          onBackToSplitBill={handleBackToSplitBill}
          onCompleteOrder={handleCompleteOrder}
        />
      )}
      {currentScreen === "complete" && (
        <CompleteScreen order={order} status={orderStatus} />
      )}
    </div>
  );
};
//あいうえお
export default App;