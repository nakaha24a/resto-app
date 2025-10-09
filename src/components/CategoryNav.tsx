// src/components/CategoryNav.tsx

import React from "react";

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
    <div className="category-nav">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-tab ${
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
