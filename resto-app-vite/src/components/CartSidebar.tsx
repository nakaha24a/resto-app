/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import useCartStore from "../store/cartStore";
import type { CartItem } from "../types";

interface CartSidebarProps {
  cart: CartItem[];
  totalAmount: number;
  onPlaceOrder: () => void;
  onGoToPayment: () => void; // 親コンポーネントとの互換性のため残しておきますが、使いません
  pendingOrderTotalAmount: number;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  totalAmount,
  onPlaceOrder,
  // onGoToPayment, // ボタンを消すので、ここでは使わなくなります
  pendingOrderTotalAmount,
}) => {
  const { updateCartItemQuantity, removeFromCart } = useCartStore();
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const handleQuantityChange = (
    index: number,
    currentQty: number,
    delta: number
  ) => {
    const newQuantity = currentQty + delta;
    if (newQuantity <= 0) {
      setRemovingIndex(index);
      setTimeout(() => {
        removeFromCart(index);
        setRemovingIndex(null);
      }, 300);
    } else {
      updateCartItemQuantity(index, newQuantity);
    }
  };

  const handleRemove = (index: number) => {
    setRemovingIndex(index);
    setTimeout(() => {
      removeFromCart(index);
      setRemovingIndex(null);
    }, 300);
  };

  // 小計（これから注文するもの）のみを表示する場合
  // もし「注文済み＋今回の注文」の合計を表示したい場合はここを調整
  // 今回はお会計ボタンを消すので、ここでの合計表示の意味合いも「今回の注文額」に集中させます
  // const grandTotal = pendingOrderTotalAmount + totalAmount;

  const renderOptions = (options: any[]) => {
    if (!options || options.length === 0) return null;
    return options
      .map((opt) => (typeof opt === "string" ? opt : opt.name))
      .join(", ");
  };

  return (
    <>
      <style>
        {`
        /* ========= カートサイドバー（シンプル版） ========= */
        .cart-sidebar-simple {
          width: 380px;
          min-width: 300px;
          height: 100%;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          border-left: 1px solid #e0e0e0;
          box-shadow: -2px 0 10px rgba(0,0,0,0.05);
          color: #333;
        }

        /* ========= ヘッダー ========= */
        .cart-header-simple {
          padding: 20px;
          border-bottom: 1px solid #eee;
          background-color: #fff;
        }

        .cart-title-simple {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #333;
        }

        .item-count-badge {
          background: #ff9f43;
          color: white;
          border-radius: 50%;
          padding: 2px 8px;
          font-size: 0.85rem;
          font-weight: bold;
        }

        /* 注文済み金額（ヘッダーで少し控えめに表示するだけ残す） */
        .pending-summary-simple {
          margin-top: 10px;
          padding: 8px 12px;
          background-color: #f9f9f9;
          border-radius: 6px;
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
          color: #555;
        }
        .pending-amount {
          font-weight: bold;
          color: #333;
        }

        /* ========= アイテムリスト ========= */
        .cart-items-simple {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background-color: #fafafa;
        }

        /* カートアイテムカード */
        .cart-item-simple {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
          transition: opacity 0.3s;
        }
        
        .cart-item-simple.removing {
          opacity: 0;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .item-name {
          font-weight: bold;
          font-size: 1rem;
          color: #333;
        }

        .item-price {
          font-weight: bold;
          color: #333;
        }

        /* オプション表示 */
        .item-options-text {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 10px;
          padding-left: 10px;
          border-left: 3px solid #ddd;
        }

        /* 数量操作エリア */
        .item-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        .qty-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f0f0f0;
          border-radius: 20px;
          padding: 2px;
        }

        .qty-btn-simple {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: white;
          cursor: pointer;
          font-weight: bold;
          color: #555;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: background 0.2s;
        }
        .qty-btn-simple:hover:not(:disabled) {
          background: #e0e0e0;
        }
        .qty-btn-simple:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .qty-val {
          font-weight: bold;
          min-width: 20px;
          text-align: center;
        }

        .del-btn-simple {
          font-size: 0.8rem;
          color: #999;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }
        .del-btn-simple:hover {
          color: #d63031;
        }

        /* ========= フッター ========= */
        .cart-footer-simple {
          padding: 20px;
          background: white;
          border-top: 1px solid #eee;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 1.1rem; /* 少し大きく */
          color: #333;
        }
        
        .grand-total {
          margin-top: 10px;
          margin-bottom: 20px;
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
          border-top: 1px dashed #ddd;
          padding-top: 10px;
        }
        .grand-total .amount {
          color: #e74c3c;
          font-size: 1.5rem;
        }

        /* ボタン類 */
        .btn-base {
          width: 100%;
          padding: 16px; /* 少し大きくして押しやすく */
          border-radius: 8px;
          border: none;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          transition: filter 0.2s;
          margin-bottom: 0; /* 下のマージンを削除 */
          text-align: center;
        }
        .btn-base:hover:not(:disabled) {
          filter: brightness(0.9);
        }
        .btn-base:active:not(:disabled) {
          transform: translateY(1px);
        }

        .btn-confirm {
          background-color: #34495e;
          color: white;
          box-shadow: 0 4px 10px rgba(52, 73, 94, 0.3);
        }
        .btn-confirm:disabled {
          background-color: #ccc;
          box-shadow: none;
          cursor: not-allowed;
        }
        
        .empty-state {
          text-align: center;
          color: #aaa;
          margin-top: 50px;
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 10px;
          display: block;
        }
        `}
      </style>

      <div className="cart-sidebar-simple">
        {/* ヘッダー */}
        <div className="cart-header-simple">
          <h2 className="cart-title-simple">
            🛒 注文リスト
            {cart.length > 0 && (
              <span className="item-count-badge">{cart.length}</span>
            )}
          </h2>
          {/* ヘッダーには「現在のお会計額」として参考情報だけ残しておきます */}
          {pendingOrderTotalAmount > 0 && (
            <div className="pending-summary-simple">
              <span>これまでの注文額</span>
              <span className="pending-amount">
                ¥{pendingOrderTotalAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* 商品リスト */}
        <div className="cart-items-simple">
          {cart.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              商品をカートに入れてください
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className={`cart-item-simple ${
                  removingIndex === index ? "removing" : ""
                }`}
              >
                <div className="item-row">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">
                    ¥{(item.totalPrice || 0).toLocaleString()}
                  </span>
                </div>

                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="item-options-text">
                    オプション: {renderOptions(item.selectedOptions)}
                  </div>
                )}

                <div className="item-controls-row">
                  <div className="qty-wrapper">
                    <button
                      className="qty-btn-simple"
                      onClick={() =>
                        handleQuantityChange(index, item.quantity, -1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn-simple"
                      onClick={() =>
                        handleQuantityChange(index, item.quantity, 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="del-btn-simple"
                    onClick={() => handleRemove(index)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* フッター */}
        <div className="cart-footer-simple">
          {/* 今回の注文合計だけをシンプルに表示 */}
          <div className="total-row grand-total">
            <span>合計</span>
            <span className="amount">¥{totalAmount.toLocaleString()}</span>
          </div>

          {/* 注文確定ボタンのみ配置 */}
          <button
            className="btn-base btn-confirm"
            disabled={cart.length === 0}
            onClick={onPlaceOrder}
          >
            {cart.length > 0 ? "注文を確定する" : "商品を選択してください"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
