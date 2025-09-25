import React, { useState } from "react";
import PartyInputScreen from "./components/PartyInputScreen";
import OrderScreen from "./components/OrderScreen";
import CartScreen from "./components/CartScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import PaymentScreen from "./components/PaymentScreen";
import CompleteScreen from "./components/CompleteScreen";
import TitleScreen from "./components/TitleScreen";
import { Member, CartItem, Order } from "./types";
import "./components/styles.css";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<string>("title");
  const [members, setMembers] = useState<Member[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("注文受付中");

  const handleStartOrder = (members: Member[]) => {
    setMembers(members);
    setCurrentScreen("order");
  };

  const handleGoToCart = () => {
    setCurrentScreen("cart");
  };

  const handleBackToOrder = () => {
    setCurrentScreen("order");
  };

  const handleGoToCheckout = () => {
    setCurrentScreen("checkout");
  };

  const handleGoToPayment = () => {
    setCurrentScreen("payment");
  };

  const handleBackToPartyInput = () => {
    setCurrentScreen("partyInput");
  };

  const handleUpdateCart = (newCart: CartItem[]) => {
    setCart(newCart);
  };

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

    // 注文状況をシミュレート
    setOrderStatus("注文受付中");
    setTimeout(() => {
      setOrderStatus("調理中");
    }, 3000);
    setTimeout(() => {
      setOrderStatus("完了");
    }, 8000);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "title":
        return <TitleScreen onStart={() => setCurrentScreen("partyInput")} />;
      case "partyInput":
        return <PartyInputScreen onStartOrder={handleStartOrder} />;
      case "order":
        return (
          <OrderScreen
            members={members}
            cart={cart}
            onUpdateCart={handleUpdateCart}
            onGoToCart={handleGoToCart}
            onBackToPartyInput={handleBackToPartyInput}
          />
        );
      case "cart":
        return (
          <CartScreen
            cart={cart}
            members={members}
            onUpdateCart={handleUpdateCart}
            onBackToOrder={handleBackToOrder}
            onGoToSplitBill={handleGoToCheckout}
          />
        );
      case "checkout":
        return (
          <CheckoutScreen
            cart={cart}
            members={members}
            onBackToOrder={handleBackToOrder}
            onGoToPayment={handleGoToPayment}
          />
        );
      case "payment":
        // ★ この部分が正しく「PaymentScreen」を呼び出していることを確認してください
        return (
          <PaymentScreen
            onBackToSplitBill={handleGoToCheckout}
            onCompleteOrder={handleCompleteOrder}
          />
        );
      case "complete":
        return <CompleteScreen order={order} status={orderStatus} />;
      default:
        return <TitleScreen onStart={() => setCurrentScreen("partyInput")} />;
    }
  };

  return <div className="app-container">{renderScreen()}</div>;
};

export default App;
