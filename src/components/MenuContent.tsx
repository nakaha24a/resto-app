// src/components/MenuContent.tsx

import React, { useEffect, useState } from "react";
import useCartStore from "../store/cartStore";
import { CartItem, MenuItem, Option, MenuData, Category } from "../types";
import OptionModal from "./OptionModal";

interface MenuContentProps {
  selectedCategory: string | null;
  searchQuery: string; // ★ 検索キーワードを受け取る
}

const API_BASE_URL = "http://localhost:3000";

const MenuContent: React.FC<MenuContentProps> = ({
  selectedCategory,
  searchQuery,
}) => {
  // ★ searchQuery を受け取る
  const {
    cart,
    updateCart,
    menuData,
    fetchMenuData,
    loading: menuLoading,
    error: menuError,
  } = useCartStore();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!menuData && !menuLoading) {
      fetchMenuData();
    }
  }, [fetchMenuData, menuData, menuLoading]);

  const getItemQuantity = (menuItemId: string) => {
    return cart
      .filter(
        (item: CartItem) =>
          item.menuItemId === menuItemId &&
          (!item.selectedOptions || item.selectedOptions.length === 0)
      )
      .reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  };

  const handleItemClick = (item: MenuItem) => {
    if (
      item.options &&
      Array.isArray(item.options) &&
      item.options.length > 0
    ) {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      const quantity = getItemQuantity(item.id);
      updateCart(item, quantity + 1, []);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleAddToCartWithOptions = (options: Option[], quantity: number) => {
    if (selectedItem) {
      updateCart(selectedItem, quantity, options);
    }
    handleCloseModal();
  };

  if (menuLoading && !menuData) {
    return (
      <div className="menu-list-container">
        <p style={{ textAlign: "center", padding: "20px" }}>
          メニュー読み込み中...
        </p>
      </div>
    );
  }
  if (menuError) {
    return (
      <div className="menu-list-container">
        <p style={{ color: "red", textAlign: "center", padding: "20px" }}>
          {menuError}
        </p>
      </div>
    );
  }
  if (!menuData || !menuData.categories || menuData.categories.length === 0) {
    return (
      <div className="menu-list-container">
        <p style={{ textAlign: "center", padding: "20px" }}>
          表示できるメニューがありません。
        </p>
      </div>
    );
  }

  // --- 表示するメニュー項目をフィルタリング ---
  let itemsToShow: MenuItem[] = [];

  if (!selectedCategory || selectedCategory === "TOP") {
    itemsToShow = menuData.categories.flatMap((cat: Category) => cat.items);
  } else if (selectedCategory === "おすすめ") {
    itemsToShow = menuData.categories.flatMap((cat: Category) =>
      cat.items.filter((item: MenuItem) => item.isRecommended)
    );
  } else {
    const category = menuData.categories.find(
      (cat: Category) => cat.name === selectedCategory
    );
    itemsToShow = category ? category.items : [];
  }

  // ★↓↓↓ 検索キーワードでの絞り込み処理を追加 ↓↓↓
  if (searchQuery) {
    itemsToShow = itemsToShow.filter(
      (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())
      // (説明文でも検索する場合は以下を追加)
      // || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  // ★↑↑↑ 絞り込み処理ここまで ↑↑↑

  return (
    <div className="menu-list-container">
      <div className="menu-content">
        {itemsToShow.length === 0 && (
          <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            該当する商品がありません。
          </p>
        )}

        {itemsToShow.map((item) => {
          const quantity = getItemQuantity(item.id);
          return (
            <div key={item.id} className="menu-item">
              <div
                className="menu-item-clickable"
                onClick={() => handleItemClick(item)}
              >
                <img
                  src={`${API_BASE_URL}${
                    item.image || "/assets/placeholder.png"
                  }`}
                  alt={item.name}
                  className="menu-image"
                  onError={(e) =>
                    (e.currentTarget.src = `${API_BASE_URL}/assets/placeholder.png`)
                  }
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

              {(!item.options || item.options.length === 0) && (
                <div className="quantity-control">
                  <button
                    className="quantity-button minus"
                    onClick={() => updateCart(item, quantity - 1, [])}
                    disabled={quantity === 0}
                  >
                    −
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button
                    className="quantity-button plus"
                    onClick={() => updateCart(item, quantity + 1, [])}
                  >
                    ＋
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedItem && isModalOpen && (
        <OptionModal
          menuItem={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCartWithOptions}
          imageUrl={`${API_BASE_URL}${selectedItem.image || ""}`}
        />
      )}
    </div>
  );
};

export default MenuContent;
