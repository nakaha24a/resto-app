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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    rgba(0,0,0,0.9) 100%
  );
  color: #fff;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  margin: 0;
}

.hero-subtitle {
  margin-top: 10px;
  font-size: 1rem;
  opacity: 0.85;
  letter-spacing: 0.08em;
}

/* ========= MAIN ACTION ========= */
.main-action {
  padding: 36px 28px;
  margin-top: -40px;
}

.menu-main-btn {
  width: 100%;
  padding: 38px 20px;
  border-radius: 26px;
  border: none;
  background: linear-gradient(135deg, #2b2b2b, #111);
  color: #fff;
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  box-shadow: 0 18px 50px rgba(0,0,0,0.35);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: transform .25s ease, box-shadow .25s ease;
}

.menu-main-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 65px rgba(0,0,0,0.45);
}

.menu-main-btn:active {
  transform: translateY(-1px);
}

.menu-sub {
  font-size: 0.85rem;
  opacity: 0.7;
  letter-spacing: 0.15em;
}

/* ========= RECOMMEND ========= */
.recommend-scroll {
  display: flex;
  gap: 22px;
  padding: 10px 28px 40px;
  overflow-x: auto;
  scrollbar-width: none;
}

.recommend-scroll::-webkit-scrollbar {
  display: none;
}

.rec-card {
  min-width: 240px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,.18);
  cursor: pointer;
  transition: transform .25s ease, box-shadow .25s ease;
}

.rec-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 55px rgba(0,0,0,.28);
}

.rec-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  filter: contrast(1.05) saturate(0.95);
}

.rec-info {
  padding: 16px;
}

.rec-name {
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.rec-price {
  font-weight: 700;
  color: #b79b5b; /* ゴールド */
  letter-spacing: 0.04em;
}

/* ========= CALL STAFF ========= */
.call-btn-area {
  padding: 10px 28px 20px;
}

.quick-btn.call {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(0,0,0,0.25);
  border-radius: 14px;
  padding: 18px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: background .2s ease;
}

.quick-btn.call:hover {
  background: rgba(0,0,0,0.04);
}

/* ========= PC ========= */
@media (min-width: 1024px) {
  .hero { height: 380px; }
  .main-action,
  .call-btn-area {
    max-width: 640px;
    margin: 0 auto;
  }
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
            <span className="menu-sub">TAP TO ORDER</span>
          </button>
        </div>

        {/* RECOMMEND */}
        {recommendations.length > 0 && (
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
