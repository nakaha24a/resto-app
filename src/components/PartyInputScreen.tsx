// src/components/PartyInputScreen.tsx

import React, { useState } from "react";

interface PartyInputScreenProps {
  onStartOrder: (tableNumber: string) => void;
}

const PartyInputScreen: React.FC<PartyInputScreenProps> = ({
  onStartOrder,
}) => {
  const [tableNumber, setTableNumber] = useState("");

  const handleStart = () => {
    if (tableNumber.trim() !== "") {
      onStartOrder(tableNumber);
    } else {
      alert("席番号を入力してください。");
    }
  };

  return (
    <div className="screen party-input-screen">
      <h1>ご注文を開始します</h1>
      <p>ご利用の席番号を入力してください。</p>

      <input
        type="text"
        placeholder="例: T-05"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
      />

      <button onClick={handleStart} disabled={tableNumber.trim() === ""}>
        メニューへ進む
      </button>
    </div>
  );
};

export default PartyInputScreen;
