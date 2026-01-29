import React, { useState } from "react";
import type { MenuItem as MenuItemType } from "../types";
import OptionModal from "./OptionModal";
import useCartStore from "../store/cartStore";

interface MenuItemProps {
  item: MenuItemType;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // パソコンのIPアドレスがわかっている場合はそれに書き換えてください
  // 例: "http://192.168.1.15:3000"
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://172.16.31.16:3000";

  // ★ここを修正：どんなパスが来ても確実に「assets」を含めたURLを作る
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";

    // すでにhttpがついている完全なURLならそのまま返す
    if (imagePath.startsWith("http")) return imagePath;

    // 先頭の / を削除してきれいにする
    let cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

    // ★ここが重要修正ポイント★
    // パスの中に「assets」も「static」も含まれていなければ、「assets/」を先頭に足す
    if (!cleanPath.startsWith("assets/") && !cleanPath.startsWith("static/")) {
      cleanPath = `assets/${cleanPath}`;
    }

    return `${API_BASE_URL}/${cleanPath}`;
  };

  const handleItemClick = () => {
    // ★修正: オプションの有無に関わらず、常にモーダルを開くように変更
    // これにより、すべての商品で「詳細確認 → 個数選択 → カート追加」の流れに統一されます
    setIsModalOpen(true);
  };

  const handleModalConfirm = (quantity: number, selectedOptions: string[]) => {
    addToCart(item, quantity, selectedOptions);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="menu-item">
        <div className="menu-item-clickable" onClick={handleItemClick}>
          <div
            style={{
              width: "100%",
              height: "180px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="menu-image"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                // エラーになったらconsoleに実際のURLを出して確認できるようにする
                console.error(
                  "画像読み込み失敗:",
                  (e.target as HTMLImageElement).src
                );
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x200?text=No+Image";
              }}
            />
          </div>

          <div className="menu-info">
            <div className="menu-name">{item.name}</div>
            <div className="menu-description">
              {item.description || "美味しいメニューです。"}
            </div>
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
