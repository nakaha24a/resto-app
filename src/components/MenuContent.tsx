import React, { useEffect, useState } from "react";
import useCartStore from "../store/cartStore";
import { CartItem, MenuItem, Option, MenuData, Category } from "../types";
import OptionModal from "./OptionModal";

interface MenuContentProps {
  selectedCategory: string | null;
  searchQuery: string;
}

// ★ 修正: localhost を .env 変数から読み込む
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

const MenuContent: React.FC<MenuContentProps> = ({
  selectedCategory,
  searchQuery,
}) => {
  const {
    cart,
    updateCart,
    menuData,
    fetchMenuData,
    menuLoading,
    error: menuError,
  } = useCartStore();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // App.tsx で menuData を読み込むため、この useEffect は不要
  /*
  useEffect(() => {
    if (!menuData && !menuLoading) {
      fetchMenuData();
    }
  }, [fetchMenuData, menuData, menuLoading]);
  */

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
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
        {/* ★ 修正: テキストをローディングスピナーに変更 */}
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }
  if (menuError) {
    return (
      <div className="error-container">
        <p>メニューの読み込みに失敗しました。</p>
        <p style={{ fontSize: "0.8rem", color: "gray" }}>{menuError}</p>
        <button
          className="call-staff-button-header" // 既存のボタンスタイルを流用
          onClick={() => fetchMenuData()} // ストアのアクションを直接呼ぶ
        >
          再読み込み
        </button>
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
  if (searchQuery) {
    itemsToShow = itemsToShow.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="menu-list-container">
      <div className="menu-content">
        {itemsToShow.length === 0 && (
          <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            該当する商品がありません。
          </p>
        )}

        {itemsToShow.map((item) => {
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
                  onError={(e: any) =>
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
              {/* ★ UI/UX改善のため、数量コントロールブロックは削除済み */}
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
