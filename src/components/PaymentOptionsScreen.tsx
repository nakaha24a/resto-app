// src/components/PaymentOptionsScreen.tsx

import React from "react";
import useCartStore from "../store/cartStore";

interface PaymentOptionsScreenProps {
  onGoToSplitBill: () => void;
  onCallStaff: (message: string) => void;
  onBack: () => void;
}

const PaymentOptionsScreen: React.FC<PaymentOptionsScreenProps> = ({
  onGoToSplitBill,
  onCallStaff,
  onBack,
}) => {
  const { pendingOrderTotalAmount } = useCartStore();

  return (
    <div className="screen payment-options-screen">
      <h2 className="screen-title">お支払い方法の選択</h2>

      <div className="payment-summary">
        <p className="total-label">お会計金額 (税込)</p>
        <p className="total-amount-display">
          ¥{pendingOrderTotalAmount.toLocaleString()}
        </p>
      </div>

      <div className="payment-options-grid">
        <div
          className="option-card full-payment"
          onClick={() => onCallStaff("個別会計（現金/カード）")}
        >
          <span className="card-icon">🧍</span>
          <h3 className="card-title">個別会計</h3>
          <p className="card-description">
            お一人様ずつ、レジにて現金またはカードでお支払いします。
          </p>
          <button className="option-button primary">
            個別会計で店員を呼ぶ
          </button>
        </div>

        <div className="option-card split-payment" onClick={onGoToSplitBill}>
          <span className="card-icon">🧑‍🤝‍🧑</span>
          <h3 className="card-title">割り勘計算</h3>
          <p className="card-description">
            人数や端数処理を指定して、一人あたりの金額を計算します。
          </p>
          <button className="option-button secondary">割り勘計算に進む</button>
        </div>
      </div>

      <button className="back-button-bottom" onClick={onBack}>
        ← 注文履歴に戻る
      </button>
    </div>
  );
};

export default PaymentOptionsScreen;
