// src/components/OptionModal.tsx

import React, { useState } from "react";
import { MenuItem, Option } from "../types";

interface OptionModalProps {
  menuItem: MenuItem;
  onClose: () => void;
  onAddToCart: (options: Option[]) => void;
}

const OptionModal: React.FC<OptionModalProps> = ({
  menuItem,
  onClose,
  onAddToCart,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const handleToggleOption = (option: Option) => {
    setSelectedOptions((prev) =>
      prev.some((o) => o.name === option.name)
        ? prev.filter((o) => o.name !== option.name)
        : [...prev, option]
    );
  };

  const handleSubmit = () => {
    onAddToCart(selectedOptions);
  };

  if (!menuItem.options) return null;

  const totalOptionPrice = selectedOptions.reduce(
    (sum, opt) => sum + opt.price,
    0
  );
  const totalPrice = menuItem.price + totalOptionPrice;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{menuItem.name}</h2>
        <h3>{menuItem.options.title}</h3>
        <div className="options-list">
          {menuItem.options.items.map((option) => (
            <label key={option.name}>
              <input
                type="checkbox"
                checked={selectedOptions.some((o) => o.name === option.name)}
                onChange={() => handleToggleOption(option)}
              />
              {option.name} (+¥{option.price})
            </label>
          ))}
        </div>
        <div className="modal-footer">
          <div className="modal-total-price">
            合計: ¥{totalPrice.toLocaleString()}
          </div>
          <div className="modal-controls">
            <button onClick={onClose} className="secondary-btn">
              キャンセル
            </button>
            <button onClick={handleSubmit} className="primary-btn">
              カートに追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionModal;
