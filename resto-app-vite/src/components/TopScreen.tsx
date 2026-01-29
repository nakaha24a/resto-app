 
import React, { useState, useRef } from "react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  isNew?: boolean;
  isSeasonal?: boolean;
}

interface TopScreenProps {
  categories: string[];
  recommendations: MenuItem[];
  onSelectCategory: (category: string) => void;
  onCallStaff: (message: string) => void;
}

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x250?text=No+Image";

const TopScreen: React.FC<TopScreenProps> = ({
  recommendations,
  onSelectCategory,
  onCallStaff,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setCanScrollLeft] = useState(false);
  const [, setCanScrollRight] = useState(true);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      title: "WELCOME",
      subtitle: "画面から簡単にご注文いただけます",
    },
  ];

  const getImageUrl = (image?: string) => {
    if (!image) return PLACEHOLDER_IMG;
    if (image.startsWith("http")) return image;
    return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <>
      <style>
        {`
/* ========= 共通 ========= */
.top-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #f2f1ee;
  padding-bottom: 90px;
  overflow-x: hidden;
  font-family: "Noto Sans JP", system-ui, sans-serif;
}

/* ========= HERO ========= */
.hero {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.hero-slide {
  position: absolute;
  inset: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7) contrast(1.08);
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 70px 32px 32px;
  background: linear-gradient(
    transparent 0%,
    rgba(0,0,0,0.7) 100%
  );
  color: #fff;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.hero-subtitle {
  margin-top: 10px;
  font-size: 1rem;
  opacity: 0.95;
  letter-spacing: 0.08em;
  font-weight: 500;
}

/* ========= MAIN ACTION (修正: 重なりを解消) ========= */
.main-action {
  padding: 24px 28px;
  /* margin-top: -40px;  <-- これを削除して重なりをなくしました */
  background: #fff; /* 背景を白にして区切りを明確に */
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}

.menu-main-btn {
  width: 100%;
  padding: 30px 20px;
  border-radius: 16px;
  border: none;
  background: #222;
  color: #fff;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  transition: transform .2s ease;
}

.menu-main-btn:active {
  transform: scale(0.98);
}

.menu-sub {
  font-size: 0.9rem;
  font-weight: normal;
  opacity: 0.8;
  letter-spacing: 0.05em;
  margin-left: 10px;
}

/* ========= RECOMMEND (修正: 見出しを追加) ========= */
.recommend-section {
  padding: 30px 0;
  background: #f8f9fa; /* 背景色をつけてエリアを分ける */
}

.recommend-header {
  padding: 0 28px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.recommend-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  letter-spacing: 0.05em;
  margin: 0;
  border-left: 5px solid #b79b5b; /* 左にアクセントライン */
  padding-left: 12px;
}

.recommend-scroll {
  display: flex;
  gap: 16px;
  padding: 0 28px 20px;
  overflow-x: auto;
  scrollbar-width: none;
}
.recommend-scroll::-webkit-scrollbar {
  display: none;
}

.rec-card {
  min-width: 200px; /* サイズ調整 */
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  cursor: pointer;
}

.rec-image {
  width: 100%;
  height: 130px;
  object-fit: cover;
}

.rec-info {
  padding: 12px;
}

.rec-name {
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 4px;
  line-height: 1.4;
}

.rec-price {
  font-weight: bold;
  color: #b79b5b;
}

/* ========= CALL STAFF ========= */
.call-btn-area {
  padding: 20px 28px 40px;
  width: 100%;
  box-sizing: border-box;
}

.quick-btn.call {
  width: 100%;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 18px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* ========= PC ========= */
@media (min-width: 1024px) {
  .hero { height: 400px; }
}
        `}
      </style>

      <div className="top-container">
        {/* HERO */}
        <div className="hero">
          {heroSlides.map((slide, i) => (
            <div key={i} className="hero-slide">
              <img src={slide.image} className="hero-image" alt={slide.title} />
              <div className="hero-overlay">
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN MENU ACTION */}
        <div className="main-action">
          <button
            className="menu-main-btn"
            onClick={() => onSelectCategory("ALL")}
          >
            メニューを見る
            <span className="menu-sub">Tap to Order</span>
          </button>
        </div>

        {/* RECOMMEND */}
        {recommendations.length > 0 && (
          <div className="recommend-section">
            <div className="recommend-header">
              <h3 className="recommend-title">おすすめメニュー</h3>
            </div>

            <div
              className="recommend-scroll"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  className="rec-card"
                  onClick={() => onSelectCategory(item.category || "メニュー")}
                >
                  <img
                    src={getImageUrl(item.image)}
                    className="rec-image"
                    alt={item.name}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = PLACEHOLDER_IMG)
                    }
                  />
                  <div className="rec-info">
                    <div className="rec-name">{item.name}</div>
                    <div className="rec-price">
                      ¥{item.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CALL STAFF */}
        <div className="call-btn-area">
          <button
            className="quick-btn call"
            onClick={() => onCallStaff("スタッフ呼び出し")}
          >
            🔔 店員を呼ぶ
          </button>
        </div>
      </div>
    </>
  );
};

export default TopScreen;
