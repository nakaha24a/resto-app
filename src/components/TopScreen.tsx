import React, { useState, useEffect } from "react";

// 型定義（既存のMenuItem型を使用）
interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  isNew?: boolean;
  isSeasonal?: boolean;
  popularity?: number;
  isRecommended?: boolean;
}

interface TopScreenProps {
  categories: string[];
  recommendations: MenuItem[];
  onSelectCategory: (category: string) => void;
  onCallStaff: (message: string) => void;
  onSelectItem?: (item: MenuItem) => void;
}

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x250?text=No+Image";

const TopScreen: React.FC<TopScreenProps> = ({
  categories,
  recommendations,
  onSelectCategory,
  onCallStaff,
  onSelectItem,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  // ヒーローバナー用のコンテンツ
  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      title: "ようこそ",
      subtitle: "美味しい料理をお楽しみください",
    },
    {
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      title: "本日のおすすめ",
      subtitle: "シェフ厳選の特別メニュー",
    },
  ];

  // 自動スライド
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return PLACEHOLDER_IMG;
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${path}`;
  };

  // カテゴリアイコンマッピング
  const categoryIcons: { [key: string]: string } = {
    前菜: "🥗",
    メイン: "🍖",
    デザート: "🍰",
    ドリンク: "🍷",
    サイドメニュー: "🍟",
    コース: "🍽️",
    default: "🍽️",
  };

  // おすすめメニューが実際に存在する場合のみ表示
  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <div style={styles.container}>
      {/* 1. ヒーローエリア（スライドショー） */}
      <div style={styles.heroSlider}>
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            style={{
              ...styles.heroSlide,
              opacity: currentSlide === index ? 1 : 0,
              zIndex: currentSlide === index ? 1 : 0,
            }}
          >
            <img src={slide.image} alt={slide.title} style={styles.heroImage} />
            <div style={styles.heroOverlay}>
              <h1 style={styles.heroTitle}>{slide.title}</h1>
              <p style={styles.heroSubtitle}>{slide.subtitle}</p>
            </div>
          </div>
        ))}

        {/* スライドインジケーター */}
        {heroSlides.length > 1 && (
          <div style={styles.slideIndicators}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  ...styles.indicator,
                  backgroundColor:
                    currentSlide === index ? "#fff" : "rgba(255,255,255,0.5)",
                }}
                aria-label={`スライド ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. クイックアクション */}
      <div style={styles.quickActions}>
        <button
          style={styles.quickBtn}
          onClick={() => onCallStaff("お水をお願いします")}
        >
          <span style={styles.quickIcon}>💧</span>
          <span style={styles.quickText}>お水</span>
        </button>
        <button
          style={styles.quickBtn}
          onClick={() => onCallStaff("おしぼりをお願いします")}
        >
          <span style={styles.quickIcon}>🧻</span>
          <span style={styles.quickText}>おしぼり</span>
        </button>
        <button
          style={{ ...styles.quickBtn, ...styles.callBtn }}
          onClick={() => onCallStaff("スタッフ呼び出し")}
        >
          <span style={styles.quickIcon}>🔔</span>
          <span style={styles.quickText}>店員呼出</span>
        </button>
      </div>

      {/* 3. カテゴリグリッド */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.titleBar}></span>
          カテゴリーから探す
        </h2>
        <div style={styles.categoryGrid}>
          {categories
            .filter((c) => c !== "TOP" && c !== "おすすめ")
            .map((cat) => (
              <button
                key={cat}
                style={styles.categoryCard}
                onClick={() => onSelectCategory(cat)}
              >
                <span style={styles.categoryIcon}>
                  {categoryIcons[cat] || categoryIcons.default}
                </span>
                <span style={styles.categoryName}>{cat}</span>
              </button>
            ))}
        </div>
      </section>

      {/* 4. おすすめメニュー（データがある場合のみ表示） */}
      {hasRecommendations && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.titleBar}></span>
            シェフのおすすめ
          </h2>
          <div style={styles.recommendationScroll}>
            {recommendations.map((item) => (
              <div
                key={item.id}
                style={styles.recCard}
                onClick={() => {
                  // おすすめアイテムをクリックしたら、そのカテゴリに移動
                  if (item.category && item.category !== "TOP") {
                    onSelectCategory(item.category);
                  } else {
                    // カテゴリ情報がない場合はメニュー画面へ
                    onSelectCategory("メニュー");
                  }
                }}
              >
                {item.isNew && <div style={styles.newBadge}>NEW</div>}
                {item.isSeasonal && (
                  <div style={styles.seasonalBadge}>期間限定</div>
                )}

                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  style={styles.recImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                  }}
                />

                <div style={styles.recInfo}>
                  <h3 style={styles.recName}>{item.name}</h3>
                  {item.description && (
                    <p style={styles.recDescription}>{item.description}</p>
                  )}
                  <p style={styles.recPrice}>¥{item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* おすすめメニューがない場合のメッセージ（開発中のみ表示） */}
      {!hasRecommendations && process.env.NODE_ENV === "development" && (
        <div style={styles.emptyMessage}>
          <p>おすすめメニューはまだ設定されていません</p>
          <p style={{ fontSize: "0.9rem", color: "#999" }}>
            管理画面からメニューに「おすすめ」フラグを設定してください
          </p>
        </div>
      )}

      {/* 余白 */}
      <div style={{ height: "100px" }}></div>
    </div>
  );
};

// スタイル定義
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    backgroundColor: "#f8f9fa",
    paddingBottom: "80px",
  },

  // ヒーロースライダー
  heroSlider: {
    position: "relative",
    width: "100%",
    height: "280px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  heroSlide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    transition: "opacity 1s ease-in-out",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "40px 20px 20px",
    color: "#fff",
  },
  heroTitle: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: "800",
    letterSpacing: "0.05em",
  },
  heroSubtitle: {
    margin: "8px 0 0",
    fontSize: "1.1rem",
    opacity: 0.95,
  },
  slideIndicators: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "8px",
    zIndex: 2,
  },
  indicator: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
  },

  // クイックアクション
  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    padding: "0 20px",
    marginBottom: "30px",
  },
  quickBtn: {
    background: "white",
    border: "2px solid #e0e0e0",
    borderRadius: "16px",
    padding: "20px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.2s",
  },
  callBtn: {
    background: "linear-gradient(135deg, #f39c12, #d35400)",
    borderColor: "#f39c12",
    color: "white",
  },
  quickIcon: {
    fontSize: "2rem",
  },
  quickText: {
    fontSize: "1rem",
    fontWeight: "700",
  },

  // セクション共通
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.4rem",
    fontWeight: "800",
    margin: "0 20px 20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#2c3e50",
  },
  titleBar: {
    width: "5px",
    height: "24px",
    backgroundColor: "#ff9f43",
    borderRadius: "3px",
  },

  // カテゴリグリッド
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    padding: "0 20px",
  },
  categoryCard: {
    background: "white",
    border: "none",
    borderRadius: "20px",
    height: "100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  categoryIcon: {
    fontSize: "2.5rem",
  },
  categoryName: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#333",
  },

  // おすすめメニュー
  recommendationScroll: {
    display: "flex",
    overflowX: "auto",
    gap: "20px",
    padding: "0 20px 10px",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
  },
  recCard: {
    position: "relative",
    minWidth: "220px",
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    cursor: "pointer",
    scrollSnapAlign: "start",
    transition: "transform 0.2s",
  },
  newBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#ff6b6b",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 1,
  },
  seasonalBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#1dd1a1",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 1,
  },
  recImage: {
    width: "100%",
    height: "140px",
    objectFit: "cover",
  },
  recInfo: {
    padding: "15px",
  },
  recName: {
    margin: "0 0 8px",
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#333",
  },
  recDescription: {
    margin: "0 0 10px",
    fontSize: "0.85rem",
    color: "#777",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  recPrice: {
    margin: 0,
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#ff6b6b",
  },

  // 空メッセージ
  emptyMessage: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
  },
};

export default TopScreen;
