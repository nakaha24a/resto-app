import React, { useState } from "react";

interface PaymentScreenProps {
  onBackToSplitBill: () => void;
  onCompleteOrder: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  onBackToSplitBill,
  onCompleteOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<
    "qr" | "card" | "cash" | null
  >(null);

  const handleSelectPaymentMethod = (method: "qr" | "card" | "cash") => {
    setPaymentMethod(method);
  };

  return (
    <div className="screen payment-screen">
      <h2>支払い方法選択</h2>
      <div className="payment-options">
        <button
          className={
            paymentMethod === "qr" ? "payment-button active" : "payment-button"
          }
          onClick={() => handleSelectPaymentMethod("qr")}
        >
          <i className="fa-solid fa-qrcode"></i> QRコード決済
        </button>
        <button
          className={
            paymentMethod === "card"
              ? "payment-button active"
              : "payment-button"
          }
          onClick={() => handleSelectPaymentMethod("card")}
        >
          <i className="fa-solid fa-credit-card"></i> クレジットカード
        </button>
        <button
          className={
            paymentMethod === "cash"
              ? "payment-button active"
              : "payment-button"
          }
          onClick={() => handleSelectPaymentMethod("cash")}
        >
          <i className="fa-solid fa-yen-sign"></i> 現金
        </button>
      </div>
      <div className="button-group">
        <button onClick={onBackToSplitBill}>戻る</button>
        <button
          className="cta-button"
          onClick={onCompleteOrder}
          disabled={!paymentMethod}
        >
          決済を実行
        </button>
      </div>
    </div>
  );
};

export default PaymentScreen;
