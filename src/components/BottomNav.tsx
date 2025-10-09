// src/components/BottomNav.tsx

import React from "react";
import { NavTab } from "./OrderScreen";

interface BottomNavProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  cartItemCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigate,
  cartItemCount,
}) => {
  return (
    <div className="fixed-bottom-bar">
      <div
        className={`nav-tab ${activeTab === "TOP" ? "active" : ""}`}
        onClick={() => onNavigate("TOP")}
      >
        <span className="nav-tab-icon">🏠</span>
        <span>トップ</span>
      </div>
      <div
        className={`nav-tab ${activeTab === "ORDER" ? "active" : ""}`}
        onClick={() => onNavigate("ORDER")}
      >
        <span className="nav-tab-icon">📋</span>
        <span>注文</span>
        {cartItemCount > 0 && <span className="badge">{cartItemCount}</span>}
      </div>
      <div
        className={`nav-tab ${activeTab === "HISTORY" ? "active" : ""}`}
        onClick={() => onNavigate("HISTORY")}
      >
        <span className="nav-tab-icon">🧾</span>
        <span>履歴・お会計</span>
      </div>
    </div>
  );
};

export default BottomNav;
