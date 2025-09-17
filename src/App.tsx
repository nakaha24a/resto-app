import React, { useState } from "react";
import PartyInputScreen from "./components/PartyInputScreen";
import OrderScreen from "./components/OrderScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import CompleteScreen from "./components/CompleteScreen";
import { Member, CartItem, Order } from "./types";
import "./components/styles.css";

// 画面の種類を定義する型
type Screen = "partyInput" | "order" | "checkout" | "complete";
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

  // 注文画面から会計画面へ遷移する
  const handleGoToCheckout = () => {
    setCurrentScreen("checkout");
  };

  // 会計画面から注文完了画面へ遷移し、注文処理を行う
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
        />
      )}
      {currentScreen === "checkout" && (
        <CheckoutScreen
          cart={cart}
          members={members}
          onBackToOrder={() => setCurrentScreen("order")}
          onCompleteOrder={handleCompleteOrder}
        />
      )}
      {currentScreen === "complete" && (
        <CompleteScreen order={order} status={orderStatus} />
      )}
    </div>
  );
};

export default App;
