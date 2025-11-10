// src/components/MenuContent.tsx
// ★ 修正版: すべての商品でモーダルを開くように統一

import React, { useEffect, useState } from "react";
import useCartStore from "../store/cartStore";
import { CartItem, MenuItem, Option, MenuData, Category } from "../types";
import OptionModal from "./OptionModal";

interface MenuContentProps {
  selectedCategory: string | null;
  searchQuery: string;
}

// ★ 修正: API_BASE_URL の定義を OptionModal と共有するため、
// store/cartStore.ts または types/index.ts など共通の場所に移動し、
// ここではインポートする形が望ましいですが、一旦そのままにします。
const API_BASE_URL = "http://localhost:3000";

const MenuContent: React.FC<MenuContentProps> = ({
  selectedCategory,
  searchQuery,
}) => {
  const {
    cart, // ★ updateCart は使わなくなるので削除
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

  // ★ 修正: getItemQuantity は不要になるため削除
  /*
  const getItemQuantity = (menuItemId: string) => {
    // ... (削除) ...
  };
  */

  // ★★★ 修正 (最重要) ★★★
  // オプションの有無にかかわらず、必ずモーダルを開くようにする
  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    /* ★ 修正: 元の else 節 (直接カートに追加するロジック) を削除
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
    */
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // ★ 修正: この関数名は OptionModal に渡すものなので変更なし
  const handleAddToCartWithOptions = (options: Option[], quantity: number) => {
    if (selectedItem) {
      // ★ 修正: オプションがない商品の場合、quantity=0 (削除) が来ると
      // カートから探すのが大変になるため、updateCart 側で
      // 「IDとオプションが一致するものを更新」するようにストアのロジックを見直す必要があります。
      // (ここでは一旦、元のロジックのままにしておきます)
      updateCart(selectedItem, quantity, options);
    }
    handleCloseModal();
  };

  // (中略: ... menuLoading, menuError, !menuData の表示は変更なし ...)
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

  // (中略: ... フィルタリングロジックは変更なし ...)
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
          // ★ 修正: getItemQuantity は使わないので削除
          // const quantity = getItemQuantity(item.id);

          return (
            <div key={item.id} className="menu-item">
              <div
                className="menu-item-clickable"
                onClick={() => handleItemClick(item)} // ★ 動作は handleItemClick に統一
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

              {/* ★★★ 修正 (最重要) ★★★ */}
              {/* 数量コントロール(.quantity-control)のブロック全体を削除 */}
              {/*
              {(!item.options || item.options.length === 0) && (
                <div className="quantity-control">
                  ... (このブロック全体を削除) ...
                </div>
              )}
              */}
            </div>
          );
        })}
      </div>

      {/* モーダル表示ロジックは変更なし */}
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
