// src/components/MenuContent.tsx

import React, { useEffect, useState } from "react";
import useCartStore from "../store/cartStore";
// ★ OptionModal で使うため Option をインポート
import { CartItem, MenuItem, Option, MenuData, Category } from "../types";
import OptionModal from "./OptionModal";

interface MenuContentProps {
  selectedCategory: string | null;
}

const API_BASE_URL = "http://localhost:3000";

const MenuContent: React.FC<MenuContentProps> = ({ selectedCategory }) => {
  const { cart, updateCart } = useCartStore();

  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MenuData = await response.json();
        setMenuData(data);
      } catch (e: any) {
        console.error("メニューデータの取得に失敗しました:", e);
        setError(`メニューデータの読み込みに失敗しました: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const getItemQuantity = (menuItemId: string) => {
    return cart
      .filter(
        (
          item: CartItem // ★ CartItem 型を明示
        ) =>
          item.menuItemId === menuItemId &&
          (!item.selectedOptions || item.selectedOptions.length === 0)
      )
      .reduce((sum, item: CartItem) => sum + item.quantity, 0); // ★ CartItem 型を明示
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

  if (loading) {
    return (
      <div className="menu-content">
        <p>メニューを読み込み中...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="menu-content">
        <p style={{ color: "red" }}>エラー: {error}</p>
      </div>
    );
  }
  if (!menuData || !menuData.categories || menuData.categories.length === 0) {
    return (
      <div className="menu-content">
        <p>表示できるメニューがありません。</p>
      </div>
    );
  }

  let itemsToShow: MenuItem[] = [];
  if (!selectedCategory || selectedCategory === "TOP") {
    // ★ Category 型を明示
    itemsToShow = menuData.categories.flatMap((cat: Category) => cat.items);
  } else if (selectedCategory === "おすすめ") {
    // ★ Category, MenuItem 型を明示
    itemsToShow = menuData.categories.flatMap((cat: Category) =>
      cat.items.filter((item: MenuItem) => item.isRecommended)
    );
  } else {
    // ★ Category 型を明示
    const category = menuData.categories.find(
      (cat: Category) => cat.name === selectedCategory
    );
    itemsToShow = category ? category.items : [];
  }

  return (
    <div className="menu-list-container">
      <div className="menu-content">
        {itemsToShow.length === 0 && <p>該当する商品がありません。</p>}
        {itemsToShow.map((item) => {
          const quantity = getItemQuantity(item.id);
          return (
            <div key={item.id} className="menu-item">
              <div
                className="menu-item-clickable"
                onClick={() => handleItemClick(item)}
              >
                <img
                  // ★ imageUrl を image に修正
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
                  {/* ★ allergens を表示 (types/index.ts で定義されている前提) */}
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
