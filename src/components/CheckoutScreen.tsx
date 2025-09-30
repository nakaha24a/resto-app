// src/components/CheckoutScreen.tsx (修正・全画面対応版)

import React from "react";
import { CartItem } from "../types";

interface CheckoutScreenProps {
  // カートの内容をそのまま受け取ります
  orderItems: CartItem[];
  // 注文を確定し、COMPLETE_ORDER画面へ遷移するハンドラ
  onPlaceOrder: () => void;
  // 注文画面に戻り、修正を行うハンドラ
  onBackToOrder: () => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  orderItems,
  onPlaceOrder,
  onBackToOrder,
}) => {
  // 注文合計金額の計算
  const calculateTotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrderClick = () => {
    // App.tsxの注文確定ロジックを呼び出し、画面遷移をトリガー
    onPlaceOrder();
  };

  return (
    // CSSクラス 'checkout-screen-full' で全画面レイアウトを適用
    <div className="screen checkout-screen-full">
      <h2 className="screen-title">✅ 最終注文確認</h2>

      <div className="order-details-box">
        <h3 className="list-title">ご注文内容 ({orderItems.length}種類)</h3>

        {/* 注文リスト (スクロールエリア) */}
        <div className="checkout-list-scroll">
          <ul className="order-list">
            {orderItems.map((item) => (
              <li key={item.menuItemId} className="order-item-detail">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">{item.quantity} 点</span>
                <span className="item-price">
                  {/* 小計の表示 */}¥
                  {(item.price * item.quantity).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 合計金額表示エリア */}
      <div className="total-summary-area">
        <div className="summary-row-total">
          <span className="total-label">総合計 (税込)</span>
          <span className="total-amount-large">
            ¥{calculateTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* コントロールボタン (フッター) */}
      <div className="checkout-controls-footer">
        <button
          onClick={onBackToOrder}
          className="control-button secondary-btn"
        >
          <span role="img" aria-label="back">
            ←
          </span>{" "}
          注文内容を修正する
        </button>
        <button
          onClick={handlePlaceOrderClick}
          className="control-button primary-btn"
          disabled={calculateTotal === 0}
        >
          この内容で注文を**確定**する
        </button>
      </div>
    </div>
  );
};

export default CheckoutScreen;
