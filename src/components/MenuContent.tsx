// src/components/MenuContent.tsx

import React, { useEffect, useState } from "react";
import useCartStore from "../store/cartStore";
import { CartItem, MenuItem, Option, MenuData, Category } from "../types";
import OptionModal from "./OptionModal";

interface MenuContentProps {
  selectedCategory: string | null;
  searchQuery: string;
}

const API_BASE_URL = "http://localhost:3000";

const MenuContent: React.FC<MenuContentProps> = ({
  selectedCategory,
  searchQuery,
}) => {
  // ★ ストアから 'menuLoading' を正しく取得
  const {
    cart,
    updateCart,
    menuData,
    fetchMenuData,
    menuLoading, // ★ 'loading: menuLoading,' ではなく 'menuLoading'
    error: menuError,
  } = useCartStore();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] =
    useState(
      false
    ); /* // ★ App.tsx が menuData を読み込むため、この useEffect は不要
  useEffect(() => {
    if (!menuData && !menuLoading) {
      fetchMenuData();
    }
  }, [fetchMenuData, menuData, menuLoading]);
  */ // ★ UI/UX 改善のため、常にモーダルを開く

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
  }; // (中略: ローディングとエラー表示は変更なし)

  if (menuLoading && !menuData) {
    return (
      <div className="menu-list-container">
               {" "}
        <p style={{ textAlign: "center", padding: "20px" }}>
                    メニュー読み込み中...        {" "}
        </p>
             {" "}
      </div>
    );
  }
  if (menuError) {
    return (
      <div className="menu-list-container">
               {" "}
        <p style={{ color: "red", textAlign: "center", padding: "20px" }}>
                    {menuError}       {" "}
        </p>
             {" "}
      </div>
    );
  }
  if (!menuData || !menuData.categories || menuData.categories.length === 0) {
    return (
      <div className="menu-list-container">
               {" "}
        <p style={{ textAlign: "center", padding: "20px" }}>
                    表示できるメニューがありません。        {" "}
        </p>
             {" "}
      </div>
    );
  } // (中略ここまで) // --- 表示するメニュー項目をフィルタリング --- // ★ 修正: 't' の消し残しを削除
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
    ); // ★ 修正: 'temsToShow' -> 'itemsToShow'
    itemsToShow = category ? category.items : [];
  }
  if (searchQuery) {
    itemsToShow = itemsToShow.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="menu-list-container">
           {" "}
      <div className="menu-content">
               {" "}
        {itemsToShow.length === 0 && (
          <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                        該当する商品がありません。          {" "}
          </p>
        )}
               {" "}
        {itemsToShow.map((item) => {
          return (
            <div key={item.id} className="menu-item">
                           {" "}
              <div
                className="menu-item-clickable"
                onClick={() => handleItemClick(item)}
              >
                               {" "}
                <img
                  src={`${API_BASE_URL}${
                    item.image || "/assets/placeholder.png"
                  }`}
                  alt={item.name}
                  className="menu-image" // ★ 修正: 'tonError' -> 'onError' // ★ 修正: 'e' に 'any' 型を指定
                  onError={(e: any) =>
                    (e.currentTarget.src = `${API_BASE_URL}/assets/placeholder.png`)
                  }
                />
                               {" "}
                <div className="menu-info">
                                    <p className="menu-name">{item.name}</p>   
                               {" "}
                  <p className="menu-description">{item.description}</p>       
                           {" "}
                  {item.allergens && item.allergens.length > 0 && (
                    <p className="menu-allergens">
                                            アレルギー:{" "}
                      {item.allergens.join(", ")}                   {" "}
                    </p>
                  )}
                                   {" "}
                  <p className="menu-price">¥{item.price.toLocaleString()}</p> 
                               {" "}
                </div>
                             {" "}
              </div>
                           {" "}
              {/* ★ UI/UX改善のため、数量コントロールブロックは削除済み */}     
                   {" "}
            </div>
          );
        })}
             {" "}
      </div>
           {" "}
      {selectedItem && isModalOpen && (
        <OptionModal
          menuItem={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCartWithOptions}
          imageUrl={`${API_BASE_URL}${selectedItem.image || ""}`}
        />
      )}
         {" "}
    </div>
  );
};

export default MenuContent;
