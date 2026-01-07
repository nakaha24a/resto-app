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
      <div className="header-left">
        {/* シンプルにテーブル番号のみ表示 */}
        <div className="tablet-info">
          Table: {userId.replace("T-", "").replace("user", "")}
        </div>
      </div>

      <div className="search-bar-container">
        <input
          id="menu-search-input"
          name="menuSearch"
          autoComplete="off"
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

      <style>{`
        .header-left {
          display: flex;
          align-items: center;
        }
        /* 金額表示用のスタイルは削除 */
      `}</style>
    </header>
  );
};

export default OrderHeader;
