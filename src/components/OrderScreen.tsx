// src/components/OrderScreen.tsx (エラー修正・完成版)

import React, { useMemo, useState, useEffect } from "react";
import useCartStore from "../store/cartStore";
// ★ CartItem をインポートします
import { MenuItem, Option, CartItem } from "../types";

// 分割したコンポーネントをインポート
import OrderHistoryPane from "./OrderHistoryPane";
import OrderHeader from "./OrderHeader";
import CategoryNav from "./CategoryNav";
import MenuContent from "./MenuContent";
import CartSidebar from "./CartSidebar";
import OptionModal from "./OptionModal";
import BottomNav from "./BottomNav";

export type NavTab = "TOP" | "ORDER" | "HISTORY";

interface OrderScreenProps {
  userId: string;
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onGoToPayment: () => void;
  setShowOrderComplete: (show: boolean) => void;
}

interface ModalState {
  isOpen: boolean;
  menuItem: MenuItem | null;
}

const getCategories = (menuItems: MenuItem[]): string[] => {
  const categories = new Set(menuItems.map((item: MenuItem) => item.category)); // ★ 型指定
  const hasRecommended = menuItems.some((item: MenuItem) => item.isRecommended); // ★ 型指定
  return [
    "TOP",
    ...(hasRecommended ? ["おすすめ"] : []),
    ...Array.from(categories),
  ];
};

const OrderScreen: React.FC<OrderScreenProps> = ({
  userId,
  activeTab,
  onNavigate,
  onGoToPayment,
  setShowOrderComplete,
}) => {
  const {
    cart,
    pendingOrders,
    cartTotalAmount,
    pendingOrderTotalAmount,
    menuItems,
    updateCart,
    placeOrder,
    fetchMenuItems,
  } = useCartStore();

  const CATEGORIES = useMemo(() => getCategories(menuItems), [menuItems]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES.length > 0 ? CATEGORIES[0] : "TOP"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    menuItem: null,
  });

  // ★ テスト用の console.log は削除
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleItemSelect = (item: MenuItem) => {
    if (item.options) {
      setModalState({ isOpen: true, menuItem: item });
    } else {
      const existingItem = cart.find(
        // ★ 型指定 (c: CartItem)
        (c: CartItem) =>
          c.menuItemId === item.id &&
          (!c.selectedOptions || c.selectedOptions.length === 0)
      );
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      updateCart(item.id, currentQuantity + 1, []);
    }
  };

  const handleAddToCartFromModal = (options: Option[]) => {
    if (modalState.menuItem) {
      const optionsId = options
        .map((opt: Option) => opt.name) // ★ 型指定
        .sort()
        .join("-");
      const cartItemId = `${modalState.menuItem.id}-${optionsId}`;
      // ★ 型指定 (c: CartItem)
      const existingItem = cart.find((c: CartItem) => c.id === cartItemId);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      updateCart(modalState.menuItem.id, currentQuantity + 1, options);
      setModalState({ isOpen: false, menuItem: null });
    }
  };

  // ★ async/await に修正
  const handlePlaceOrder = async () => {
    const newOrder = await placeOrder(userId);
    if (newOrder) {
      setShowOrderComplete(true);
      setTimeout(() => setShowOrderComplete(false), 2500);
    }
  };

  const filteredMenuItems = useMemo(() => {
    let items = menuItems;
    if (selectedCategory === "おすすめ") {
      // ★ 型指定 (item: MenuItem)
      items = items.filter((item: MenuItem) => item.isRecommended);
    } else if (selectedCategory !== "TOP") {
      // ★ 型指定 (item: MenuItem)
      items = items.filter(
        (item: MenuItem) => item.category === selectedCategory
      );
    }

    if (searchQuery) {
      // ★ 型指定 (item: MenuItem)
      items = items.filter((item: MenuItem) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  const renderMainContent = () => {
    if (activeTab === "ORDER" || activeTab === "TOP") {
      return (
        <>
                   {" "}
          <CategoryNav
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
                   {" "}
          <MenuContent
            menuItems={filteredMenuItems}
            cart={cart}
            onUpdateCart={updateCart}
            onItemSelect={handleItemSelect}
          />
                   {" "}
          <CartSidebar
            cart={cart}
            totalAmount={cartTotalAmount}
            onUpdateCart={updateCart}
            onPlaceOrder={handlePlaceOrder}
            onGoToPayment={onGoToPayment}
            pendingOrderTotalAmount={pendingOrderTotalAmount}
          />
                 {" "}
        </>
      );
    } else if (activeTab === "HISTORY") {
      return (
        <OrderHistoryPane
          pendingOrders={pendingOrders}
          orderHistoryTotalAmount={pendingOrderTotalAmount}
          onGoToPaymentView={onGoToPayment}
          onCallStaff={() => alert("スタッフを呼び出しました。")}
        />
      );
    }
    return null;
  };

  return (
    <div className="order-screen-layout">
      {/* ★ テスト用の <h1> は削除 */}
           {" "}
      <OrderHeader
        userId={userId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCallStaff={() => alert("スタッフを呼び出しました。")}
      />
           {" "}
      <div
        className={`order-main-area ${
          activeTab === "HISTORY" ? "history-layout" : ""
        }`}
      >
                {renderMainContent()}     {" "}
      </div>
           {" "}
      <BottomNav
        activeTab={activeTab}
        onNavigate={onNavigate}
        // ★ 型指定 (sum: number, item: CartItem)
        cartItemCount={cart.reduce(
          (sum: number, item: CartItem) => sum + item.quantity,
          0
        )}
      />
           {" "}
      {modalState.isOpen && modalState.menuItem && (
        <OptionModal
          menuItem={modalState.menuItem}
          onClose={() => setModalState({ isOpen: false, menuItem: null })}
          onAddToCart={handleAddToCartFromModal}
        />
      )}
         {" "}
    </div>
  );
};

export default OrderScreen;
