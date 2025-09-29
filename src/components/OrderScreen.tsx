// src/components/OrderScreen.tsx

import React from "react";
import { OrderItem, CartItem, MenuItem } from "../types";

interface OrderScreenProps {
  cart: CartItem[];
  onUpdateCart: (item: OrderItem, quantityChange: number) => void;
  onGoToCheckout: () => void;
  // ★店員呼び出しの理由指定をなくし、シンプルなハンドラに変更
  onCallStaff: () => void;
  // ★会計機能の開始ハンドラを追加
  onGoToPayment: () => void;
}

const OrderScreen: React.FC<OrderScreenProps> = ({
  cart,
  onUpdateCart,
  onGoToCheckout,
  onCallStaff, // シンプルな呼び出し
  onGoToPayment, // 会計開始
}) => {
  // 例として、ハードコードされた商品データ (省略)
  const menuItems: MenuItem[] = [
    { id: "1", name: "ハンバーガー", price: 500 },
    { id: "2", name: "ポテト", price: 300 },
    { id: "3", name: "コーラ", price: 200 },
    { id: "4", name: "サラダ", price: 450 },
  ];

  const handleAddItem = (item: MenuItem) => {
    const itemWithQuantity: OrderItem = { ...item, quantity: 1 };
    onUpdateCart(itemWithQuantity, 1);
  };

  const handleUpdateQuantity = (item: CartItem, change: number) => {
    onUpdateCart(item, change);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const calculateTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="main-layout">
      {/* 1. メインコンテンツエリア (メニューとカート) (省略なし) */}
      <div className="content-area">
        {/* 左側: メニュー */}
        <div className="menu-pane">
          <h2>メニュー一覧</h2>
          <div className="menu-list">
            {menuItems.map((item) => (
              <div key={item.id} className="menu-item">
                <span>
                  {item.name} (¥{item.price})
                </span>
                <button onClick={() => handleAddItem(item)}>追加</button>
              </div>
            ))}
          </div>
        </div>

        {/* 右側: カート */}
        <div className="cart-pane">
          <h3>注文内容 ({totalItems}点)</h3>
          {cart.length === 0 ? (
            <p>カートに商品が入っていません。</p>
          ) : (
            <ul className="cart-list">
              {cart.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <div className="quantity-control">
                    <button onClick={() => handleUpdateQuantity(item, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item, 1)}>
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="cart-summary">
            <p>
              合計金額: <strong>¥{calculateTotal}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. コントロールバー (下部) */}
      <div className="control-bar">
        {/* ★店員呼び出しボタンをシンプルに */}
        <button className="call-staff-button" onClick={onCallStaff}>
          <span role="img" aria-label="bell">
            🛎️
          </span>{" "}
          店員を呼ぶ
        </button>

        {/* ★会計ボタン */}
        <button className="checkout-button" onClick={onGoToPayment}>
          <span role="img" aria-label="money bag">
            💰
          </span>{" "}
          会計ボタン
        </button>

        {/* 注文確定ボタン */}
        <button
          className="confirm-button"
          onClick={onGoToCheckout}
          disabled={cart.length === 0}
        >
          注文を確定する (¥{calculateTotal})
        </button>
      </div>
    </div>
  );
};

export default OrderScreen;
