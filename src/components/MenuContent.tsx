/* src/components/MenuContent.tsx - 修正版 */
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

    // ★ 修正: "TOP" の処理を削除
    if (!selectedCategory) {
      // カテゴリが選択されていない場合は空配列
      return [];
    } else if (selectedCategory === "おすすめ") {
      // おすすめタブ: isRecommended が true のアイテムのみ
      items = menuData.categories.flatMap((cat: Category) =>
        cat.items.filter((item: MenuItemType) => item.isRecommended)
      );
    } else {
      // 通常カテゴリ: そのカテゴリに属するアイテムのみ
      const category = menuData.categories.find(
        (cat: Category) => cat.name === selectedCategory
      );
      items = category ? category.items : [];
    }

    // 検索フィルタリング
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQ) ||
          item.description?.toLowerCase().includes(lowerQ)
      );
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
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "60px 20px",
              color: "#999",
            }}
          >
            {searchQuery ? (
              <>
                <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
                  「{searchQuery}」に該当するメニューが見つかりません
                </p>
                <p style={{ fontSize: "0.9rem" }}>
                  別のキーワードで検索してみてください
                </p>
              </>
            ) : selectedCategory === "おすすめ" ? (
              <>
                <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
                  おすすめメニューはまだ設定されていません
                </p>
                <p style={{ fontSize: "0.9rem" }}>
                  他のカテゴリからお選びください
                </p>
              </>
            ) : (
              <p style={{ fontSize: "1.2rem" }}>
                このカテゴリにメニューがありません
              </p>
            )}
          </div>
        ) : (
          itemsToShow.map((item) => <MenuItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default MenuContent;
