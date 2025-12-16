import React, { useMemo } from "react";
import useCartStore from "../store/cartStore";
import { MenuItem } from "./MenuItem";
import { MenuItem as MenuItemType, Category } from "../types";

interface MenuContentProps {
  selectedCategory: string | null;
  searchQuery: string;
}

const MenuContent: React.FC<MenuContentProps> = ({
  selectedCategory,
  searchQuery,
}) => {
  const {
    menuData,
    menuLoading,
    error: menuError,
    fetchMenuData,
  } = useCartStore();

  const itemsToShow = useMemo(() => {
    if (!menuData || !menuData.categories) return [];

    let items: MenuItemType[] = [];

    // ★修正: TOPなら全商品を表示
    if (!selectedCategory || selectedCategory === "TOP") {
      items = menuData.categories.flatMap((cat: Category) => cat.items);
    } else if (selectedCategory === "おすすめ") {
      // おすすめタブも残しておきたい場合（DBにデータがあれば表示される）
      items = menuData.categories.flatMap((cat: Category) =>
        cat.items.filter((item: MenuItemType) => item.isRecommended)
      );
    } else {
      // 通常カテゴリ
      const category = menuData.categories.find(
        (cat: Category) => cat.name === selectedCategory
      );
      items = category ? category.items : [];
    }

    // 検索フィルタリング
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(lowerQ));
    }

    return items;
  }, [menuData, selectedCategory, searchQuery]);

  if (menuLoading && !menuData)
    return <div style={{ padding: "20px" }}>読み込み中...</div>;
  if (menuError) {
    return (
      <div style={{ color: "red", padding: "20px" }}>
        エラーが発生しました
        <button onClick={() => fetchMenuData()}>再読み込み</button>
      </div>
    );
  }

  return (
    <div className="menu-list-container">
      <div className="menu-content">
        {itemsToShow.length === 0 ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            メニューがありません
          </p>
        ) : (
          itemsToShow.map((item) => <MenuItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default MenuContent;
