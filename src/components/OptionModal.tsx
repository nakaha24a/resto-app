import React, { useState, useEffect } from "react";
import { MenuItem } from "../types";

interface OptionModalProps {
  menuItem: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, selectedOptions: string[]) => void;
}

const OptionModal: React.FC<OptionModalProps> = ({
  menuItem,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );

  // ★追加: 画像URL生成のためのロジック (MenuItem.tsxからコピー)
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://172.16.31.16:3000";

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";

    // すでにhttpがついている完全なURLならそのまま返す
    if (imagePath.startsWith("http")) return imagePath;

    // 先頭の / を削除してきれいにする
    let cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

    // パスの中に「assets」も「static」も含まれていなければ、「assets/」を先頭に足す
    if (!cleanPath.startsWith("assets/") && !cleanPath.startsWith("static/")) {
      cleanPath = `assets/${cleanPath}`;
    }

    return `${API_BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedOptions(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (optionName: string) => {
    const newOptions = new Set(selectedOptions);
    if (newOptions.has(optionName)) {
      newOptions.delete(optionName);
    } else {
      newOptions.add(optionName);
    }
    setSelectedOptions(newOptions);
  };

  const handleConfirm = () => {
    onConfirm(quantity, Array.from(selectedOptions));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>

        {menuItem.image && (
          <img
            // ★修正: getImageUrlを通して正しいURLにする
            src={getImageUrl(menuItem.image)}
            alt={menuItem.name}
            className="modal-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/300x200?text=No+Image";
            }}
          />
        )}

        <h2>{menuItem.name}</h2>
        <p>{menuItem.description}</p>

        {menuItem.options && menuItem.options.length > 0 && (
          <div className="modal-options">
            <h4>オプションを選択:</h4>
            {menuItem.options.map((option, idx) => {
              // ★安全策: optionがオブジェクトの場合にも対応できるようにする
              const isObject = typeof option === "object" && option !== null;
              // @ts-ignore
              const optionName = isObject ? option.name : option;
              // @ts-ignore
              const optionPrice = isObject ? option.price : 0;

              return (
                <div key={idx} className="option-item">
                  <input
                    type="checkbox"
                    id={`option-${idx}`}
                    checked={selectedOptions.has(optionName)}
                    onChange={() => handleOptionChange(optionName)}
                  />
                  <label htmlFor={`option-${idx}`}>
                    {optionName}
                    {optionPrice > 0 && ` (+¥${optionPrice})`}
                  </label>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-quantity">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>

        <button className="add-to-cart-button" onClick={handleConfirm}>
          カートに追加 (¥{(menuItem.price * quantity).toLocaleString()})
        </button>
      </div>
    </div>
  );
};

export default OptionModal;
