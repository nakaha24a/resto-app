// src/components/OrderHeader.tsx

import React from "react";

interface OrderHeaderProps {
  userId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCallStaff: () => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  userId,
  searchQuery,
  onSearchChange,
  onCallStaff,
}) => {
  return (
    <header className="order-header">
      <span className="tablet-info">テーブル: {userId}</span>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="メニューを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <button className="call-staff-button-header" onClick={onCallStaff}>
        スタッフを呼ぶ 🙋‍♂️
      </button>
    </header>
  );
};

export default OrderHeader;
