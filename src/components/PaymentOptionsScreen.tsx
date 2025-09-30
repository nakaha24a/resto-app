// src/components/PaymentOptionsScreen.tsx (新規)

import React from "react";

interface PaymentOptionsScreenProps {
  totalAmount: number;
  onGoToSplitBill: () => void;
  onCallStaff: (message: string) => void;
  onBack: () => void;
}

const PaymentOptionsScreen: React.FC<PaymentOptionsScreenProps> = ({
  totalAmount,
  onGoToSplitBill,
  onCallStaff,
  onBack,
}) => {
  const handleCallForPayment = () => {
    const message = `会計依頼 (合計: ${totalAmount.toLocaleString()}円 / 一括払い)`;
    onCallStaff(message);
  };

  return (
    <div className="screen payment-options-screen">
      <h2 className="screen-title">💳 お支払い方法の選択</h2>

      <div className="payment-summary">
        <p className="total-label">お会計金額 (税込)</p>
        <h1 className="total-amount-display">
          ¥{totalAmount.toLocaleString()}
        </h1>
      </div>

      <div className="payment-options-grid">
        {/* オプション 1: 一括で支払う */}
        <div
          className="option-card full-payment"
          onClick={handleCallForPayment}
        >
          <span className="card-icon">💰</span>
          <h3 className="card-title">一括で支払う</h3>
          <p className="card-description">
            合計金額をまとめてお支払いします。スタッフをお呼びください。
          </p>
          <button className="option-button primary">スタッフを呼ぶ</button>
        </div>

        {/* オプション 2: 割り勘計算を行う */}
        <div className="option-card split-payment" onClick={onGoToSplitBill}>
          <span className="card-icon">🪓</span>
          <h3 className="card-title">割り勘計算を行う</h3>
          <p className="card-description">
            人数を入力して、1人あたりの金額を計算します。
          </p>
          <button className="option-button secondary">計算に進む</button>
        </div>
      </div>

      <button className="back-button-bottom" onClick={onBack}>
        <span role="img" aria-label="back">
          ←
        </span>{" "}
        注文画面に戻る
      </button>
    </div>
  );
};

export default PaymentOptionsScreen;
