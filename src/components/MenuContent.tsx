/* src/components/MenuContent.tsx - 修正版 */
import React, { useMemo } from "react";
import useCartStore from "../store/cartStore";
import { MenuItem } from "./MenuItem";
import { MenuItem as MenuItemType, Category } from "../types";

interface MenuContentProps {
  selectedCategory: string | null;
  searchQuery: string;
}

const toKatakana = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60),
  );
};

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

    // ★修正: 変数宣言をここに一本化します（重複削除）
    let items: MenuItemType[] = [];

    // 全商品を1つの配列にまとめる（検索用、および「おすすめ」用）
    const allItems = menuData.categories.flatMap((cat: Category) => cat.items);

    // 検索ワードがあるかどうかで分岐
    if (searchQuery) {
      // 【検索モード】全商品から検索（カテゴリ無視）
      const normalizedQuery = toKatakana(searchQuery).toLowerCase();
      items = allItems.filter((item) => {
        const normalizedName = toKatakana(item.name).toLowerCase();
        const normalizedDesc = toKatakana(item.description || "").toLowerCase();
        return (
          normalizedName.includes(normalizedQuery) ||
          normalizedDesc.includes(normalizedQuery)
        );
      });
    } else {
      // 【通常モード】選択されたカテゴリの商品を表示
      if (!selectedCategory) {
        items = [];
      } else if (selectedCategory === "おすすめ") {
        items = allItems.filter((item) => item.isRecommended);
      } else {
        const category = menuData.categories.find(
          (cat: Category) => cat.name === selectedCategory,
        );
        items = category ? category.items : [];
      }
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
