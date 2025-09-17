import React, { useState } from "react";
import { CartItem, Member } from "../types";

interface CheckoutScreenProps {
  cart: CartItem[];
  members: Member[];
  onBackToOrder: () => void;
  onCompleteOrder: () => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  cart,
  members,
  onBackToOrder,
  onCompleteOrder,
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
      amount: 0,
    }));
    cart.forEach((item) => {
      const memberPayment = payments.find(
        (p) => p.member.id === item.orderedBy
      );
      if (memberPayment) {
        memberPayment.amount += item.price * item.quantity;
      }
    });
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
            <span>{payment.member.name}の注文:</span>
            <span>¥{payment.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="payment-method-section">
        <h3>支払い方法</h3>
        <button
          onClick={() => setPaymentMethod("representative")}
          className={paymentMethod === "representative" ? "active" : ""}
        >
          代表払い
        </button>
        <button
          onClick={() => setPaymentMethod("individual")}
          className={paymentMethod === "individual" ? "active" : ""}
          disabled={members.length === 1}
        >
          個別払い
        </button>
      </div>

      <div className="total">
        <strong>合計金額: ¥{totalAmount.toLocaleString()}</strong>
      </div>

      <div className="button-group">
        <button onClick={onBackToOrder}>メニューに戻る</button>
        <button className="goto-checkout-btn" onClick={onCompleteOrder}>
          {paymentMethod === "representative"
            ? "代表者がまとめて決済"
            : "決済へ進む"}
        </button>
      </div>
    </div>
  );
};

export default CheckoutScreen;
