// src/components/OptionModal.tsx

import React, { useState, useEffect } from "react";
// ★ MenuItem, Option 型をインポート
import { MenuItem, Option } from "../types";

interface OptionModalProps {
  // ★ item プロパティ名を menuItem に変更
  menuItem: MenuItem;
  isOpen: boolean; // ★ isOpen プロパティを追加
  onClose: () => void;
  // ★ onAddToCart のシグネチャを変更 (quantity を追加)
  onAddToCart: (options: Option[], quantity: number) => void;
  imageUrl: string;
}

const OptionModal: React.FC<OptionModalProps> = ({
  menuItem, // ★ item から menuItem に変更
  isOpen,
  onClose,
  onAddToCart,
  imageUrl,
}) => {
  // 数量の状態
  const [quantity, setQuantity] = useState(1);
  // 選択されたオプションの状態 (オプション名をキー、Optionオブジェクトを値とするMap)
  const [selectedOptions, setSelectedOptions] = useState<Map<string, Option>>(
    new Map()
  );

  // モーダルが開かれたときに状態をリセット
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedOptions(new Map());
    }
  }, [isOpen]);

  // オプション選択/解除のハンドラ
  const handleOptionChange = (option: Option) => {
    setSelectedOptions((prev) => {
      const newOptions = new Map(prev);
      if (newOptions.has(option.name)) {
        newOptions.delete(option.name); // 既に選択されていれば解除
      } else {
        newOptions.set(option.name, option); // 新規選択
      }
      return newOptions;
    });
  };

  // 数量を増やす
  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  // 数量を減らす (最低1)
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  // 合計金額を計算 (基本価格 + オプション価格) * 数量
  const calculateTotalPrice = () => {
    const optionsTotal = Array.from(selectedOptions.values()).reduce(
      (sum, option) => sum + option.price,
      0
    );
    // ★ menuItem.price を使用
    return (menuItem.price + optionsTotal) * quantity;
  };

  // カートに追加ボタンのハンドラ
  const handleAddToCart = () => {
    // 選択されたオプションの配列を作成
    const optionsArray = Array.from(selectedOptions.values());
    // ★ 親コンポーネントのハンドラを呼び出し (options と quantity を渡す)
    onAddToCart(optionsArray, quantity);
  };

  // isOpen が false なら何もレンダリングしない
  if (!isOpen) return null;

  return (
    // モーダルの背景オーバーレイ
    <div className="modal-overlay" onClick={onClose}>
      {/* モーダルコンテンツ (クリックイベントが伝播しないようにする) */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 閉じるボタン */}
        <button onClick={onClose} className="modal-close-button">
          &times;
        </button>
        {/* 商品画像 */}
        <img src={imageUrl} alt={menuItem.name} className="modal-image" />
        {/* 商品名 */}
        <h2>{menuItem.name}</h2>
        {/* 商品説明 */}
        <p>{menuItem.description}</p>

        {/* オプション選択セクション */}
        {/* ★ menuItem.options が存在し配列の場合のみ表示 */}
        {menuItem.options &&
          Array.isArray(menuItem.options) &&
          menuItem.options.length > 0 && (
            <div className="modal-options">
              <h4>オプションを選択:</h4>
              {menuItem.options.map((option) => (
                <div key={option.name} className="option-item">
                  <input
                    type="checkbox"
                    id={`option-${option.name}`}
                    checked={selectedOptions.has(option.name)}
                    onChange={() => handleOptionChange(option)}
                  />
                  <label htmlFor={`option-${option.name}`}>
                    {option.name} (+ ¥{option.price.toLocaleString()})
                  </label>
                </div>
              ))}
            </div>
          )}

        {/* 数量調整セクション */}
        <div className="modal-quantity">
          <button onClick={decrementQuantity} disabled={quantity <= 1}>
            -
          </button>
          <span>{quantity}</span>
          <button onClick={incrementQuantity}>+</button>
        </div>

        {/* カートに追加ボタン */}
        <button onClick={handleAddToCart} className="add-to-cart-button">
          カートに追加 - ¥{calculateTotalPrice().toLocaleString()}
        </button>
      </div>
    </div>
  );
};

export default OptionModal;
