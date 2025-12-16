import React from "react";
import { MenuItem, Category } from "../types";

// 画像がない場合のプレースホルダー（必要に応じて変更）
const PLACEHOLDER_IMG = "https://via.placeholder.com/300x200?text=No+Image";

interface TopScreenProps {
  categories: string[];
  recommendations: MenuItem[];
  onSelectCategory: (category: string) => void;
  onCallStaff: (message: string) => void;
}

const TopScreen: React.FC<TopScreenProps> = ({
  categories,
  recommendations,
  onSelectCategory,
  onCallStaff,
}) => {
  // サーバーのURL（画像表示用）
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return PLACEHOLDER_IMG;
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="top-screen-container">
      {/* 1. ヒーローエリア（看板画像） */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Welcome to Restaurant</h1>
          <p>最高のひとときをお楽しみください</p>
        </div>
      </div>

      {/* 2. クイックアクション（サービスボタン） */}
      <div className="quick-actions">
        <button onClick={() => onCallStaff("お水をお願いします")}>
          💧 お水
        </button>
        <button onClick={() => onCallStaff("おしぼりをお願いします")}>
          🧻 おしぼり
        </button>
        <button
          onClick={() => onCallStaff("スタッフ呼び出し")}
          className="call-btn"
        >
          🔔 店員呼出
        </button>
      </div>

      {/* 3. カテゴリ選択（大きなボタン） */}
      <div className="section-title">カテゴリーから探す</div>
      <div className="category-grid">
        {categories
          .filter((c) => c !== "TOP" && c !== "おすすめ")
          .map((cat) => (
            <button
              key={cat}
              className="category-card-btn"
              onClick={() => onSelectCategory(cat)}
            >
              {/* カテゴリごとにアイコンを変えたい場合はここで分岐可能 */}
              <span className="cat-icon">🍽️</span>
              <span className="cat-name">{cat}</span>
            </button>
          ))}
      </div>

      {/* 4. おすすめメニュー（横スクロール） */}
      {recommendations.length > 0 && (
        <>
          <div className="section-title">シェフのおすすめ</div>
          <div className="recommendation-scroll">
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="rec-card"
                // クリックしたらそのカテゴリへ飛ぶ、または詳細を開く（今回はカテゴリへ誘導）
                onClick={() => onSelectCategory("おすすめ")}
              >
                <img src={getImageUrl(item.image)} alt={item.name} />
                <div className="rec-info">
                  <div className="rec-name">{item.name}</div>
                  <div className="rec-price">
                    ¥{item.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 余白調整 */}
      <div style={{ height: "100px" }}></div>
    </div>
  );
};

export default TopScreen;
