import React, { useState } from "react";
import { CartItem, Member } from "../types";

interface CheckoutScreenProps {
  cart: CartItem[];
  members: Member[];
  onBackToOrder: () => void;
  onGoToPayment: () => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  cart,
  members,
  onBackToOrder,
  onGoToPayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<
    "individual" | "representative"
  >("representative");

  const getMemberName = (id: number): string => {
    const member = members.find((m) => m.id === id);
    return member?.name || `参加者${id}`;
  };

  const calculatePayments = () => {
    const payments = members.map((member) => ({
      member,
      items: cart.filter((item) => item.orderedBy === member.id),
      amount: cart
        .filter((item) => item.orderedBy === member.id)
        .reduce((sum, item) => sum + item.price * item.quantity, 0),
    }));
    return payments;
  };

  const memberPayments = calculatePayments();

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="screen checkout-screen">
      <h2>会計</h2>
      <div className="split-bill-details">
        {memberPayments.map((payment) => (
          <div key={payment.member.id} className="split-member-item">
            <h3 style={{ marginBottom: "5px" }}>{payment.member.name}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {payment.items.map((item, index) => (
                <li key={index} style={{ fontSize: "0.9rem", color: "#666" }}>
                  {item.name} x {item.quantity} (¥{item.price * item.quantity})
                </li>
              ))}
            </ul>
            <div style={{ fontWeight: "bold", marginTop: "10px" }}>
              合計: ¥{payment.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="payment-method-section">
        <h3>支払い方法</h3>
        <button
          className={
            paymentMethod === "representative"
              ? "split-button active"
              : "split-button"
          }
          onClick={() => setPaymentMethod("representative")}
        >
          代表払い
        </button>
        <button
          className={
            paymentMethod === "individual"
              ? "split-button active"
              : "split-button"
          }
          onClick={() => setPaymentMethod("individual")}
          disabled={members.length === 1}
        >
          個別払い
        </button>
      </div>

      <div className="total">
        <strong>合計金額: ¥{totalAmount.toLocaleString()}</strong>
      </div>

      <div className="button-group">
        <button className="back-button" onClick={onBackToOrder}>
          メニューに戻る
        </button>
        <button className="cta-button" onClick={onGoToPayment}>
          決済へ進む
        </button>
      </div>
    </div>
  );
};

export default CheckoutScreen;
