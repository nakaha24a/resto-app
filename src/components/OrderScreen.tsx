// src/components/OrderScreen.tsx - 画像レイアウトに合わせた刷新

import React, { useMemo, useState } from "react";
import { CartItem, MenuItem } from "../types";

// フッタータブの種類
export type NavTab = "TOP" | "ORDER" | "HISTORY" | "PAYMENT";

interface OrderScreenProps {
  userId: string;
  menuItems: MenuItem[];
  cart: CartItem[];
  totalAmount: number;
  onUpdateCart: (menuItemId: string, quantity: number) => void;
  onConfirmOrder: () => void;
  onCallStaff: () => void;
  onGoToPayment: () => void;
  // 新しいプロパティ
  onNavigate: (tab: NavTab) => void;
  activeTab: NavTab;
  pendingOrderCount: number; // 注文バッジ用
}

// メニューカテゴリの抽出
const CATEGORIES = ["Pick up", "サラダ", "パスタ", "デザート", "ドリンク"];

// メニューコンテンツ（画像グリッド）
const MenuContent: React.FC<{
  menuItems: MenuItem[];
  onUpdateCart: (id: string, q: number) => void;
  selectedCategory: string;
}> = ({ menuItems, onUpdateCart, selectedCategory }) => {
  // カテゴリでフィルタリング
  const filteredItems = useMemo(() => {
    if (selectedCategory === "Pick up") {
      // Pick upカテゴリは全て表示として扱う
      return menuItems;
    }
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  return (
    <div className="menu-content">
      <div className="menu-card-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="menu-card"
            onClick={() => onUpdateCart(item.id, 1)}
            role="button"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              // 画像がロードできない場合のフォールバック（目立つ色と文字）
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://placehold.co/200x150/d35400/ffffff?text=${item.name}`;
              }}
            />
            <span className="menu-card-price">
              ¥{item.price.toLocaleString()}
            </span>
            <div className="menu-card-info">
              <p className="menu-card-name">{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// カート/注文確認ペイン（右側）
const CartRightPane: React.FC<{
  cart: CartItem[];
  totalAmount: number;
  onUpdateCart: (id: string, q: number) => void;
  onConfirmOrder: () => void;
}> = ({ cart, totalAmount, onUpdateCart, onConfirmOrder }) => {
  // 画像ではカートアイテム一つ分の確認画面のように見えるが、ここでは現在のカート内容を表示する
  // カートの合計額と注文確定ボタンを配置する
  const isOrderReady = cart.length > 0;

  return (
    <div className="cart-right-pane">
      <h3>この内容で注文しますか？</h3>

      <div className="order-confirmation-box">
        {cart.length === 0 ? (
          <p style={{ color: "#7f8c8d", fontStyle: "italic" }}>
            メニューを選択してください。
          </p>
        ) : (
          <>
            <ul className="order-item-list" style={{ maxHeight: "40vh" }}>
              {cart.map((item) => (
                <li key={item.id}>
                  <div style={{ flexGrow: 1 }}>{item.name}</div>
                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        onUpdateCart(item.menuItemId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span style={{ padding: "0 8px" }}>{item.quantity}点</span>
                    <button
                      onClick={() =>
                        onUpdateCart(item.menuItemId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <div style={{ marginLeft: "10px" }}>
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-summary" style={{ padding: "15px 0 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <p style={{ fontWeight: "bold" }}>合計 (税込):</p>
                <strong style={{ color: "#d35400" }}>
                  ¥{totalAmount.toLocaleString()}
                </strong>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        className="confirm-order-button"
        onClick={onConfirmOrder}
        disabled={!isOrderReady}
      >
        注文を確定する
      </button>
    </div>
  );
};

// Order Screen (メインコンポーネント)
const OrderScreen: React.FC<OrderScreenProps> = (props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("パスタ");

  // どのタブがアクティブかによって表示内容を切り替えるロジックをOrderScreen側で持たせる
  // (ここでは画像デザインに集中するため、ORDERタブが常にアクティブな想定でレイアウトを構築)

  return (
    <div className="screen order-screen-layout">
      {/* メインコンテンツエリア (メニューとカートの横並び) */}
      <div className="content-area-main">
        {/* メニューペイン (左側) */}
        <div className="menu-pane">
          {/* カテゴリタブとサブフィルター */}
          <div className="menu-navigation">
            <div className="category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-tab ${
                    cat === selectedCategory ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="sub-filters">
              {/* サブフィルターの例（画像に合わせる） */}
              <button className="sub-filter-button">新メニュー</button>
              <button className="sub-filter-button">今月のおすすめ</button>
            </div>
          </div>

          {/* メニューアイテムのグリッド */}
          <MenuContent
            menuItems={props.menuItems}
            onUpdateCart={props.onUpdateCart}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* カート/注文確認ペイン (右側) */}
        <CartRightPane
          cart={props.cart}
          totalAmount={props.totalAmount}
          onUpdateCart={props.onUpdateCart}
          onConfirmOrder={props.onConfirmOrder}
        />
      </div>

      {/* 固定フッター (画像フッターナビゲーション) */}
      <div className="fixed-bottom-bar">
        {/* ナビゲーションタブ */}
        <div
          className={`nav-tab ${props.activeTab === "TOP" ? "active" : ""}`}
          onClick={() => props.onNavigate("TOP")}
        >
          <span className="nav-tab-icon">🏠</span>
          <span>トップ</span>
        </div>

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

        <div
          className={`nav-tab ${props.activeTab === "HISTORY" ? "active" : ""}`}
          onClick={() => {
            props.onNavigate("HISTORY"); // タブ切り替え
            // HISTORYタブを選択した際にお会計（SplitBillScreen）へ遷移するロジックをOrderScreen内に入れることも可能だが、
            // App.tsx側で制御する場合、ここではタブ切り替えのみを行う。
            // 実際のお会計ボタンはフッターの「お会計」ボタンが担う。
          }}
        >
          <span className="nav-tab-icon">🧾</span>
          <span>履歴・お会計</span>
        </div>

        {/* スタッフ呼び出しボタン（画像フッターに合わせたデザイン） */}
        <button
          className="staff-call-button-footer"
          onClick={props.onCallStaff}
        >
          <span role="img" aria-label="hand">
            ✋
          </span>{" "}
          スタッフ呼び出し
        </button>

        {/* 会計依頼ボタン (画像にはないが、SplitBillScreenへの遷移用として想定) */}
        <button
          className="staff-call-button-footer call-for-payment" // 別のCSSクラスでデザインを分ける
          onClick={props.onGoToPayment} // SplitBillScreenへ遷移
        >
          <span role="img" aria-label="bill">
            💰
          </span>{" "}
          お会計
        </button>
      </div>
    </div>
  );
};

export default OrderScreen;
