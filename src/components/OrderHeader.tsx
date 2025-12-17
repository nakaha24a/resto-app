/* src/components/OrderHeader.tsx */
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
      <div className="tablet-info">Table: {userId.replace("user", "")}</div>

      <div className="search-bar-container">
        {/* ★修正ポイント: id, name, autoComplete を追加 */}
        <input
          id="menu-search-input" // ★追加
          name="menuSearch" // ★追加
          autoComplete="off" // ★追加（勝手な補完を防ぐ場合）
          type="text"
          className="search-input"
          placeholder="メニューを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <button className="call-staff-button-header" onClick={onCallStaff}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span>呼出</span>
      </button>
    </header>
  );
};

export default OrderHeader;
