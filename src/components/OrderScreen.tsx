// src/components/OrderScreen.tsx - UI/UX改善とエラー修正を適用した完全版

import React, { useMemo, useState } from "react";
import { CartItem, MenuItem, Order, OrderItem } from "../types";
// 履歴タブの内容は別ファイル（OrderHistoryPane.tsx）で実装されていると想定しインポート
import OrderHistoryPane from "./OrderHistoryPane";

// ======================================
// 1. 型定義と定数
// ======================================

// フッタータブの種類
export type NavTab = "TOP" | "ORDER" | "HISTORY"; // PAYMENTは全画面遷移になったため削除

interface OrderScreenProps {
  userId: string;
  menuItems: MenuItem[];
  cart: CartItem[];
  totalAmount: number;
  onUpdateCart: (menuItemId: string, quantity: number) => void;
  onConfirmOrder: () => void; // CheckoutScreenへ遷移
  onCallStaff: () => void;
  onGoToPayment: () => void; // PaymentOptionsScreenへ遷移

  // ナビゲーション
  onNavigate: (tab: NavTab) => void;
  activeTab: NavTab;
  pendingOrderCount: number; // 注文バッジ用

  // HISTORYタブ表示用プロパティ (App.tsxから渡される)
  pendingOrders: Order[];
  pendingOrderTotalAmount: number;
}

// メニューカテゴリの抽出 (App.tsxのMOCK_MENUに合わせて適宜調整してください)
const CATEGORIES = [
  "Pick up",
  "ピザ",
  "サラダ",
  "パスタ",
  "デザート",
  "ドリンク",
];

// ======================================
// 2. 内部コンポーネント (注文メニュー表示用)
// ======================================

// 2.1. カテゴリナビゲーション (左側カラム)
const CategoryNav: React.FC<{
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
}> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="category-nav">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-tab ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

// 2.2. メニューコンテンツ (中央カラム)
const MenuContent: React.FC<{
  menuItems: MenuItem[];
  cart: CartItem[]; // 現在のカート情報を参照するために追加
  onUpdateCart: (id: string, q: number) => void;
  selectedCategory: string;
}> = ({ menuItems, cart, onUpdateCart, selectedCategory }) => {
  // カテゴリでフィルタリング
  const filteredItems = useMemo(() => {
    if (selectedCategory === "Pick up") {
      return menuItems;
    }
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  const getItemQuantity = (menuItemId: string) => {
    return cart.find((item) => item.menuItemId === menuItemId)?.quantity || 0;
  };

  return (
    <div className="menu-list-container">
      <h2>{selectedCategory}</h2>
      <div className="menu-content">
        {filteredItems.map((item) => {
          const quantity = getItemQuantity(item.id);
          return (
            <div key={item.id} className="menu-item">
              <img src={item.imageUrl} alt={item.name} className="menu-image" />
              <div className="menu-info">
                <p className="menu-name">{item.name}</p>
                <p className="menu-description">{item.description}</p>
                <p className="menu-price">¥{item.price.toLocaleString()}</p>
              </div>

              <div className="quantity-control">
                {/* 数量マイナスボタン */}
                <button
                  className="quantity-button minus"
                  onClick={() => onUpdateCart(item.id, quantity - 1)}
                  disabled={quantity === 0}
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                {/* 数量プラスボタン */}
                <button
                  className="quantity-button plus"
                  onClick={() => onUpdateCart(item.id, quantity + 1)}
                >
                  ＋
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2.3. カートサイドバー (右側カラム)
const CartSidebar: React.FC<{
  cart: CartItem[];
  totalAmount: number;
  onUpdateCart: (menuItemId: string, quantity: number) => void;
  onConfirmOrder: () => void;
}> = ({ cart, totalAmount, onUpdateCart, onConfirmOrder }) => {
  const handleUpdateQuantity = (item: CartItem, change: number) => {
    onUpdateCart(item.menuItemId, item.quantity + change);
  };

  return (
    <div className="order-sidebar">
      <h2 className="sidebar-title">🛒 現在の注文</h2>

      {cart.length === 0 ? (
        <p className="empty-cart-message">
          メニューから商品を選択してください。
        </p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.menuItemId} className="cart-item">
              <span className="item-name">{item.name}</span>
              <div className="item-control">
                <button
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item, -1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="item-quantity">{item.quantity}</span>
                <button
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item, 1)}
                >
                  ＋
                </button>
              </div>
              <span className="item-price">
                ¥{(item.price * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* 合計と注文確定ボタン */}
      <div className="cart-summary">
        <div className="summary-row">
          <span>合計 (税込)</span>
          <span className="summary-amount">
            ¥{totalAmount.toLocaleString()}
          </span>
        </div>
        <button
          className="order-confirm-button"
          onClick={onConfirmOrder}
          disabled={cart.length === 0}
        >
          注文内容を確認する →
        </button>
      </div>
    </div>
  );
};

// ======================================
// 3. メインコンポーネント (OrderScreen)
// ======================================

const OrderScreen: React.FC<OrderScreenProps> = (props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0]
  );

  // メインコンテンツのレンダリングロジック（ORDER/HISTORYで切り替え）
  const renderMainContent = () => {
    if (props.activeTab === "ORDER" || props.activeTab === "TOP") {
      // 注文メニュー（3カラムレイアウト）
      return (
        <>
          <CategoryNav
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <MenuContent
            menuItems={props.menuItems}
            cart={props.cart}
            onUpdateCart={props.onUpdateCart}
            selectedCategory={selectedCategory}
          />
          <CartSidebar
            cart={props.cart}
            totalAmount={props.totalAmount}
            onUpdateCart={props.onUpdateCart}
            onConfirmOrder={props.onConfirmOrder}
          />
        </>
      );
    } else if (props.activeTab === "HISTORY") {
      // 履歴・お会計（2カラムレイアウト）
      // OrderHistoryPaneはApp.tsxからのプロパティをそのまま渡す
      return (
        <OrderHistoryPane
          pendingOrders={props.pendingOrders}
          orderHistoryTotalAmount={props.pendingOrderTotalAmount}
          onGoToPaymentView={props.onGoToPayment}
          onCallStaff={props.onCallStaff}
        />
      );
    }
    return null;
  };

  return (
    <div className="order-screen-layout">
      {/* 1. ヘッダー */}
      <header className="order-header">
        <span className="tablet-info">テーブル: {props.userId}</span>
        <button
          className="call-staff-button-header"
          onClick={props.onCallStaff}
        >
          スタッフを呼ぶ 🙋‍♂️
        </button>
      </header>

      {/* 2. メインエリア */}
      <div
        className={`order-main-area ${
          props.activeTab === "HISTORY" ? "history-layout" : ""
        }`}
      >
        {renderMainContent()}
      </div>

      {/* 3. 固定フッター (画像フッターナビゲーション) */}
      <div className="fixed-bottom-bar">
        {/* TOPタブ */}
        <div
          className={`nav-tab ${props.activeTab === "TOP" ? "active" : ""}`}
          onClick={() => props.onNavigate("TOP")}
        >
          <span className="nav-tab-icon">🏠</span>
          <span>トップ</span>
        </div>

        {/* ORDERタブ */}
        <div
          className={`nav-tab ${props.activeTab === "ORDER" ? "active" : ""}`}
          onClick={() => props.onNavigate("ORDER")}
        >
          <span className="nav-tab-icon">📋</span>
          <span>注文</span>
          {props.pendingOrderCount > 0 && (
            <span className="badge">{props.pendingOrderCount}</span>
          )}
        </div>

        {/* HISTORYタブ */}
        <div
          className={`nav-tab ${props.activeTab === "HISTORY" ? "active" : ""}`}
          onClick={() => props.onNavigate("HISTORY")}
        >
          <span className="nav-tab-icon">🧾</span>
          <span>履歴・お会計</span>
        </div>

        {/* お会計ボタン（フッター内で大きく表示） */}
        <button
          className="payment-button-footer"
          onClick={props.onGoToPayment}
          disabled={props.pendingOrderTotalAmount === 0}
        >
          お会計をする 💳
        </button>
      </div>
    </div>
  );
};

export default OrderScreen;
