// src/components/MenuContent.tsx

import React from "react";
import { CartItem, MenuItem, Option } from "../types";

interface MenuContentProps {
  menuItems: MenuItem[];
  cart: CartItem[];
  onUpdateCart: (id: string, q: number, options?: Option[]) => void;
  onItemSelect: (item: MenuItem) => void;
}

const MenuContent: React.FC<MenuContentProps> = ({
  menuItems,
  cart,
  onUpdateCart,
  onItemSelect,
}) => {
  const getItemQuantity = (menuItemId: string) => {
    return cart
      .filter(
        (item) =>
          item.menuItemId === menuItemId &&
          (!item.selectedOptions || item.selectedOptions.length === 0)
      )
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="menu-list-container">
      <div className="menu-content">
        {menuItems.map((item) => {
          const quantity = getItemQuantity(item.id);
          return (
            <div key={item.id} className="menu-item">
              <div
                className="menu-item-clickable"
                onClick={() => onItemSelect(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="menu-image"
                />
                <div className="menu-info">
                  <p className="menu-name">{item.name}</p>
                  <p className="menu-description">{item.description}</p>
                  {item.allergens && item.allergens.length > 0 && (
                    <p className="menu-allergens">
                      アレルギー: {item.allergens.join(", ")}
                    </p>
                  )}
                  <p className="menu-price">¥{item.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="quantity-control">
                <button
                  className="quantity-button minus"
                  onClick={() => onUpdateCart(item.id, quantity - 1)}
                  disabled={quantity === 0}
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-button plus"
                  onClick={() => onUpdateCart(item.id, quantity + 1)}
                >
                  ＋
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuContent;
