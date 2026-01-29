 
import React from "react";
import type { NavTab } from "./OrderScreen";

interface BottomNavProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  cartItemCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigate,
  
}) => {
  return (
    <div className="fixed-bottom-bar">
      <div
        className={`nav-tab ${activeTab === "TOP" ? "active" : ""}`}
        onClick={() => onNavigate("TOP")}
      >
        <span className="nav-tab-icon">🏠</span>
        <span className="nav-tab-label">トップ</span>
      </div>

      <div
        className={`nav-tab ${activeTab === "ORDER" ? "active" : ""}`}
        onClick={() => onNavigate("ORDER")}
      >
        <span className="nav-tab-icon">📋</span>
        <span className="nav-tab-label">メニュー</span>
      </div>

      <div
        className={`nav-tab ${activeTab === "HISTORY" ? "active" : ""}`}
        onClick={() => onNavigate("HISTORY")}
      >
        <span className="nav-tab-icon" style={{ position: "relative" }}>
          🧾
          {/* 注文履歴バッジが必要ならここにロジック追加 */}
        </span>
        <span className="nav-tab-label">履歴・会計</span>
      </div>
    </div>
  );
};

export default BottomNav;
