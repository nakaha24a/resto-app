// src/components/OrderScreen.tsx (最終修正・完成版)

import React, { useMemo, useState } from "react";
import { CartItem, MenuItem, Order, Option } from "../types";
import OrderHistoryPane from "./OrderHistoryPane";

// ======================================
// 1. 型定義と定数
// ======================================

export type NavTab = "TOP" | "ORDER" | "HISTORY";

interface OrderScreenProps {
  userId: string;
  menuItems: MenuItem[];
  cart: CartItem[];
  totalAmount: number;
  onUpdateCart: (
    menuItemId: string,
    quantity: number,
    selectedOptions?: Option[]
  ) => void;
  onPlaceOrder: () => void;
  onCallStaff: () => void;
  onGoToPayment: () => void;
  onNavigate: (tab: NavTab) => void;
  activeTab: NavTab;
  pendingOrderCount: number;
  pendingOrders: Order[];
  pendingOrderTotalAmount: number;
}

interface ModalState {
  isOpen: boolean;
  menuItem: MenuItem | null;
}

// ======================================
// 2. ヘルパー関数
// ======================================

const getCategories = (menuItems: MenuItem[]): string[] => {
  const categories = new Set(menuItems.map((item) => item.category));
  return ["Pick up", ...Array.from(categories)];
};

// ======================================
// 3. 内部コンポーネント
// ======================================

const CategoryNav: React.FC<{
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
}> = ({ categories, selectedCategory, onSelectCategory }) => (
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

const MenuContent: React.FC<{
  menuItems: MenuItem[];
  cart: CartItem[];
  onUpdateCart: (id: string, q: number, options?: Option[]) => void;
  onItemSelect: (item: MenuItem) => void;
}> = ({ menuItems, cart, onUpdateCart, onItemSelect }) => {
  const getItemQuantity = (menuItemId: string) => {
    return cart
      .filter(
        (item) =>
          item.menuItemId === menuItemId &&
          (!item.selectedOptions || item.selectedOptions.length === 0)
      )
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="menu-list-container">
      <div className="menu-content">
        {menuItems.map((item) => {
          const quantity = getItemQuantity(item.id);
          return (
            <div key={item.id} className="menu-item">
              <div
                className="menu-item-clickable"
                onClick={() => onItemSelect(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="menu-image"
                />
                <div className="menu-info">
                  <p className="menu-name">{item.name}</p>
                  <p className="menu-description">{item.description}</p>
                  {item.allergens && item.allergens.length > 0 && (
                    <p className="menu-allergens">
                      アレルギー: {item.allergens.join(", ")}
                    </p>
                  )}
                  <p className="menu-price">¥{item.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="quantity-control">
                <button
                  className="quantity-button minus"
                  onClick={() => onUpdateCart(item.id, quantity - 1)}
                  disabled={quantity === 0}
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-button plus"
                  onClick={() => onUpdateCart(item.id, quantity + 1)}
                >
                  ＋
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CartSidebar: React.FC<{
  cart: CartItem[];
  totalAmount: number;
  onUpdateCart: (
    menuItemId: string,
    quantity: number,
    options?: Option[]
  ) => void;
  onPlaceOrder: () => void;
  onGoToPayment: () => void;
  pendingOrderTotalAmount: number;
}> = ({
  cart,
  totalAmount,
  onUpdateCart,
  onPlaceOrder,
  onGoToPayment,
  pendingOrderTotalAmount,
}) => {
  const handleUpdateQuantity = (item: CartItem, change: number) => {
    onUpdateCart(item.menuItemId, item.quantity + change, item.selectedOptions);
  };

  return (
    <div className="order-sidebar">
      <h2 className="sidebar-title">🛒 現在の注文</h2>
      {cart.length === 0 ? (
        <p className="empty-cart-message">商品が選択されていません。</p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.id} className="cart-item">
              <div className="cart-item-info">
                <span className="item-name">{item.name}</span>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <span className="item-options">
                    {item.selectedOptions.map((o) => o.name).join(", ")}
                  </span>
                )}
              </div>
              <div className="item-control">
                <button
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item, -1)}
                >
                  −
                </button>
                <span className="item-quantity">{item.quantity}</span>
                <button
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item, 1)}
                >
                  ＋
                </button>
              </div>
              <span className="item-price">
                ¥{(item.price * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="cart-summary">
        <div className="summary-row">
          <span>合計 (税込)</span>
          <span className="summary-amount">
            ¥{totalAmount.toLocaleString()}
          </span>
        </div>
        <button
          className="order-confirm-button"
          onClick={onPlaceOrder}
          disabled={cart.length === 0}
        >
          この内容で注文を確定する
        </button>
        <button
          className="goto-payment-btn"
          onClick={onGoToPayment}
          disabled={pendingOrderTotalAmount === 0 && cart.length === 0}
        >
          お会計に進む 💳
        </button>
      </div>
    </div>
  );
};

const OptionModal: React.FC<{
  menuItem: MenuItem;
  onClose: () => void;
  onAddToCart: (options: Option[]) => void;
}> = ({ menuItem, onClose, onAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const handleToggleOption = (option: Option) => {
    setSelectedOptions((prev) =>
      prev.some((o) => o.name === option.name)
        ? prev.filter((o) => o.name !== option.name)
        : [...prev, option]
    );
  };

  const handleSubmit = () => {
    onAddToCart(selectedOptions);
  };

  if (!menuItem.options) return null;

  const totalOptionPrice = selectedOptions.reduce(
    (sum, opt) => sum + opt.price,
    0
  );
  const totalPrice = menuItem.price + totalOptionPrice;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{menuItem.name}</h2>
        <h3>{menuItem.options.title}</h3>
        <div className="options-list">
          {menuItem.options.items.map((option) => (
            <label key={option.name}>
              <input
                type="checkbox"
                checked={selectedOptions.some((o) => o.name === option.name)}
                onChange={() => handleToggleOption(option)}
              />
              {option.name} (+¥{option.price})
            </label>
          ))}
        </div>
        <div className="modal-footer">
          <div className="modal-total-price">
            合計: ¥{totalPrice.toLocaleString()}
          </div>
          <div className="modal-controls">
            <button onClick={onClose} className="secondary-btn">
              キャンセル
            </button>
            <button onClick={handleSubmit} className="primary-btn">
              カートに追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================
// 4. メインコンポーネント
// ======================================
const OrderScreen: React.FC<OrderScreenProps> = (props) => {
  const CATEGORIES = useMemo(
    () => getCategories(props.menuItems),
    [props.menuItems]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    menuItem: null,
  });

  const handleItemSelect = (item: MenuItem) => {
    if (item.options) {
      setModalState({ isOpen: true, menuItem: item });
    } else {
      const existingItem = props.cart.find(
        (c) =>
          c.menuItemId === item.id &&
          (!c.selectedOptions || c.selectedOptions.length === 0)
      );
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      props.onUpdateCart(item.id, currentQuantity + 1, []);
    }
  };

  const handleAddToCartFromModal = (options: Option[]) => {
    if (modalState.menuItem) {
      const optionsId = options
        .map((opt) => opt.name)
        .sort()
        .join("-");
      const cartItemId = `${modalState.menuItem.id}-${optionsId}`;
      const existingItem = props.cart.find((c) => c.id === cartItemId);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      props.onUpdateCart(modalState.menuItem.id, currentQuantity + 1, options);
      setModalState({ isOpen: false, menuItem: null });
    }
  };

  const filteredMenuItems = useMemo(() => {
    let items = props.menuItems;
    if (selectedCategory !== "Pick up") {
      items = items.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items;
  }, [props.menuItems, selectedCategory, searchQuery]);

  const renderMainContent = () => {
    if (props.activeTab === "ORDER" || props.activeTab === "TOP") {
      return (
        <>
          <CategoryNav
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <MenuContent
            menuItems={filteredMenuItems}
            cart={props.cart}
            onUpdateCart={props.onUpdateCart}
            onItemSelect={handleItemSelect}
          />
          <CartSidebar
            cart={props.cart}
            totalAmount={props.totalAmount}
            onUpdateCart={props.onUpdateCart}
            onPlaceOrder={props.onPlaceOrder}
            onGoToPayment={props.onGoToPayment}
            pendingOrderTotalAmount={props.pendingOrderTotalAmount}
          />
        </>
      );
    } else if (props.activeTab === "HISTORY") {
      return (
        <OrderHistoryPane
          pendingOrders={props.pendingOrders}
          orderHistoryTotalAmount={props.pendingOrderTotalAmount}
          onGoToPaymentView={props.onGoToPayment}
          onCallStaff={props.onCallStaff}
        />
      );
    }
    return null;
  };

  return (
    <div className="order-screen-layout">
      <header className="order-header">
        <span className="tablet-info">テーブル: {props.userId}</span>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="メニューを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className="call-staff-button-header"
          onClick={props.onCallStaff}
        >
          スタッフを呼ぶ 🙋‍♂️
        </button>
      </header>

      <div
        className={`order-main-area ${
          props.activeTab === "HISTORY" ? "history-layout" : ""
        }`}
      >
        {renderMainContent()}
      </div>

      <div className="fixed-bottom-bar">
        <div
          className={`nav-tab ${props.activeTab === "TOP" ? "active" : ""}`}
          onClick={() => props.onNavigate("TOP")}
        >
          <span className="nav-tab-icon">🏠</span>
          <span>トップ</span>
        </div>
        <div
          className={`nav-tab ${props.activeTab === "ORDER" ? "active" : ""}`}
          onClick={() => props.onNavigate("ORDER")}
        >
          <span className="nav-tab-icon">📋</span>
          <span>注文</span>
          {props.cart.length > 0 && (
            <span className="badge">
              {props.cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </div>
        <div
          className={`nav-tab ${props.activeTab === "HISTORY" ? "active" : ""}`}
          onClick={() => props.onNavigate("HISTORY")}
        >
          <span className="nav-tab-icon">🧾</span>
          <span>履歴・お会計</span>
        </div>
      </div>

      {modalState.isOpen && modalState.menuItem && (
        <OptionModal
          menuItem={modalState.menuItem}
          onClose={() => setModalState({ isOpen: false, menuItem: null })}
          onAddToCart={handleAddToCartFromModal}
        />
      )}
    </div>
  );
};

export default OrderScreen;
