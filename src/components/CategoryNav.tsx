/* src/components/CategoryNav.tsx */
import React from "react";
// ★ CSSを読み込む（TopScreenと同じやり方です）
import "./styles/components.css";

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="category-nav-container">
      {categories.map((category) => (
        <button
          key={category}
          // ★ 選択中かどうかでクラスを切り替える
          className={`category-nav-button ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryNav;
