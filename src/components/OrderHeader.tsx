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
    <div className="order-header">
      <div className="tablet-info">テーブル: {userId}</div>
      <div className="search-bar-container">
        {/* ★ 修正: 隠しラベルを追加 (アクセシビリティ警告の修正) */}
        <label htmlFor="menu-search" className="visually-hidden">
          メニューを検索
        </label>

        <input
          type="text"
          placeholder="メニューを検索..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          // ★ 修正: id と name を追加 (アクセシビリティ警告の修正)
          id="menu-search"
          name="menu-search"
        />
      </div>
      <button onClick={onCallStaff} className="call-staff-button-header">
        スタッフ呼び出し
      </button>
    </div>
  );
};

export default OrderHeader;
