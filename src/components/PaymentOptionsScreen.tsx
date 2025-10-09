// src/components/PaymentOptionsScreen.tsx (修正後)

import React from "react";
import useCartStore from "../store/cartStore"; // ★ ストアをインポート

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
  // ★ ストアから合計金額を取得
  const { pendingOrderTotalAmount } = useCartStore();

  return (
    <div className="screen payment-options-screen">
      {/* ( ... JSXの中身は変更なし ... ) */}
      {/* 例: <div className="total-amount-display">¥{pendingOrderTotalAmount.toLocaleString()}</div> */}
    </div>
  );
};

export default PaymentOptionsScreen;
