import React, { useState } from "react";

interface SplitBillScreenProps {
  onBackToCart: () => void;
  onGoToPayment: () => void;
}

const SplitBillScreen: React.FC<SplitBillScreenProps> = ({
  onBackToCart,
  onGoToPayment,
}) => {
  const [splitType, setSplitType] = useState<"equal" | "individual" | null>(
    null
  );

  const handleSelectSplitType = (type: "equal" | "individual") => {
    setSplitType(type);
  };

  return (
    <div className="screen split-bill-screen">
      <h2>割り勘設定</h2>
      <div className="split-options">
        <button
          className={
            splitType === "equal" ? "split-button active" : "split-button"
          }
          onClick={() => handleSelectSplitType("equal")}
        >
          均等割り
        </button>
        <button
          className={
            splitType === "individual" ? "split-button active" : "split-button"
          }
          onClick={() => handleSelectSplitType("individual")}
        >
          個別会計
        </button>
      </div>
      <div className="button-group">
        <button onClick={onBackToCart}>戻る</button>
        <button
          className="cta-button"
          onClick={onGoToPayment}
          disabled={!splitType}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default SplitBillScreen;
