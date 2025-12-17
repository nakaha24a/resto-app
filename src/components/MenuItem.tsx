import React, { useState } from "react";
import { MenuItem as MenuItemType } from "../types";
import OptionModal from "./OptionModal";
import useCartStore from "../store/cartStore";

interface MenuItemProps {
  item: MenuItemType;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // サーバーのURL（画像表示用）
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "https://via.placeholder.com/150?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${path}`;
  };

  const handleItemClick = () => {
    // オプションがある場合はモーダルを開く
    if (item.options && item.options.length > 0) {
      setIsModalOpen(true);
    } else {
      // オプションがない場合は直接カートへ (数量1, オプションなし)
      addToCart(item, 1, []);
    }
  };

  const handleModalConfirm = (quantity: number, selectedOptions: string[]) => {
    addToCart(item, quantity, selectedOptions);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="menu-item">
        <div className="menu-item-clickable" onClick={handleItemClick}>
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            className="menu-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/150?text=No+Image";
            }}
          />
          <div className="menu-info">
            <div className="menu-name">{item.name}</div>
            <div className="menu-description">{item.description}</div>
            {item.allergens && item.allergens.length > 0 && (
              <div className="menu-allergens">
                アレルギー: {item.allergens.join(", ")}
              </div>
            )}
            <div className="menu-price">¥{item.price.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <OptionModal
        menuItem={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </>
  );
};
