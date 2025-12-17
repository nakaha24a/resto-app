import React, { useState, useEffect } from "react";
// ★修正: Option型は削除されたのでインポートしない
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
  // ★修正: Setの中身は string
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedOptions(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ★修正: オプションは string として受け取る
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
            src={menuItem.image}
            alt={menuItem.name}
            className="modal-image"
          />
        )}

        <h2>{menuItem.name}</h2>
        <p>{menuItem.description}</p>

        {menuItem.options && menuItem.options.length > 0 && (
          <div className="modal-options">
            <h4>オプションを選択:</h4>
            {/* ★修正: option は文字列そのもの */}
            {menuItem.options.map((optionName, idx) => (
              <div key={idx} className="option-item">
                <input
                  type="checkbox"
                  id={`option-${idx}`}
                  checked={selectedOptions.has(optionName)}
                  onChange={() => handleOptionChange(optionName)}
                />
                <label htmlFor={`option-${idx}`}>{optionName}</label>
              </div>
            ))}
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
