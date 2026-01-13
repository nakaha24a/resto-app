/* src/components/OptionModal.tsx */
import React, { useState, useEffect, useMemo } from "react";
import { MenuItem } from "../types";

interface OptionModalProps {
  menuItem: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  // ★修正: string[] ではなく any[] (価格入りオブジェクトを受け取れるように) に変更
  onConfirm: (quantity: number, selectedOptions: any[]) => void;
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

  // ... (getImageUrl や useEffect はそのままでOK) ...
  // ... (currentTotalPrice の計算ロジックもそのままでOK) ...

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://172.16.31.16:3000";
  const getImageUrl = (imagePath: string | undefined) => {
    // ... (省略: 元のコードのまま) ...
    if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    let cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
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

  const currentTotalPrice = useMemo(() => {
    const optionsTotal = Array.from(selectedOptions).reduce((sum, optName) => {
      const foundOption = menuItem.options?.find(
        (opt: any) => (typeof opt === "string" ? opt : opt.name) === optName
      );
      if (
        typeof foundOption === "object" &&
        foundOption !== null &&
        "price" in foundOption
      ) {
        return sum + (Number(foundOption.price) || 0);
      }
      return sum;
    }, 0);
    return (menuItem.price + optionsTotal) * quantity;
  }, [menuItem, selectedOptions, quantity]);

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

  // ★★★ここを修正してください★★★
  const handleConfirm = () => {
    // selectedOptions（文字のリスト）を元に、
    // メニューデータから「価格入りのオブジェクト」を探し出して復元する
    const optionsToPass = Array.from(selectedOptions).map((name) => {
      const originalOption = menuItem.options?.find(
        (opt: any) => (typeof opt === "string" ? opt : opt.name) === name
      );
      // 見つかったら「価格入りオブジェクト」を返す。なければ「名前(文字)」を返す
      return originalOption || name;
    });

    // 復元したデータ(optionsToPass)を渡す
    onConfirm(quantity, optionsToPass);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ... (表示部分は変更なし) ... */}

        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>

        {menuItem.image && (
          <img
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
          カートに追加 (¥{currentTotalPrice.toLocaleString()})
        </button>
      </div>
    </div>
  );
};

export default OptionModal;
