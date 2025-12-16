import React, { useState } from "react";
import useCartStore from "../store/cartStore";
import { MenuItem as MenuItemType } from "../types";

// ★ここ重要: サーバーのURL設定
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

// ★ここ重要: 画像URLを正しく直す関数
const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return `${API_BASE_URL}/static/placeholder.png`;
  if (imagePath.startsWith("http")) return imagePath;

  // パスの先頭に / があるかないかで調整
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${path}`;
};

interface MenuItemProps {
  item: MenuItemType;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  // 型エラー回避のため any を使用
  const addToCart = useCartStore((state: any) => state.addToCart);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // item.options が無い場合に備えて空配列にする
  const optionsList = Array.isArray(item.options) ? item.options : [];
  const hasOptions = optionsList.length > 0;

  // カート追加ボタンが押された時の処理
  const handleAddToCartClick = () => {
    if (hasOptions) {
      setQuantity(1);
      setSelectedOptions([]);
      setIsModalOpen(true);
    } else {
      addToCart({ ...item, quantity: 1, selectedOptions: [] });
    }
  };

  // モーダルからのカート追加
  const handleModalAddToCart = () => {
    // 選択されたオプション情報の配列を作る
    const selectedOptionObjects = optionsList.filter((opt: any) =>
      selectedOptions.includes(opt.name)
    );

    addToCart({
      ...item,
      quantity: quantity,
      selectedOptions: selectedOptionObjects, // 文字列ではなくオブジェクトを渡す
    });
    setIsModalOpen(false);
  };

  const toggleOption = (optName: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optName)
        ? prev.filter((o) => o !== optName)
        : [...prev, optName]
    );
  };

  return (
    <>
      {/* --- メニューカード本体 --- */}
      <div className={`menu-item ${item.isRecommended ? "recommended" : ""}`}>
        {/* ★修正: getImageUrlを使って画像を表示 */}
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="menu-image"
          onError={(e: any) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = "none"; // エラーなら非表示
          }}
        />

        <div className="menu-info">
          <div className="menu-name">{item.name}</div>
          <div className="menu-description">{item.description}</div>
          <div className="menu-price">¥{item.price.toLocaleString()}</div>
        </div>

        <div className="quantity-control">
          <button
            className="add-to-cart-button"
            style={{ padding: "8px 16px", fontSize: "1rem", marginTop: "10px" }}
            onClick={handleAddToCartClick}
          >
            カートに追加
          </button>
        </div>
      </div>

      {/* --- オプション選択モーダル --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-button"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            {/* ★ここも修正: getImageUrlを使う */}
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="modal-image"
            />

            <h2>{item.name}</h2>
            <p>{item.description}</p>

            <div className="modal-options">
              <h4>オプション選択</h4>
              {optionsList.map((opt: any) => (
                <div key={opt.name} className="option-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(opt.name)}
                      onChange={() => toggleOption(opt.name)}
                    />
                    {opt.name} <span>(+¥{opt.price})</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-quantity">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <button
              className="add-to-cart-button"
              onClick={handleModalAddToCart}
            >
              カートに追加 (¥
              {(
                (item.price +
                  selectedOptions.reduce((sum, optName) => {
                    const opt = optionsList.find(
                      (o: any) => o.name === optName
                    );
                    return sum + (opt ? opt.price : 0);
                  }, 0)) *
                quantity
              ).toLocaleString()}
              )
            </button>
          </div>
        </div>
      )}
    </>
  );
};
