// src/components/OrderScreen.tsx (分割後の親コンポーネント)

import React, { useMemo, useState } from "react";
import { CartItem, MenuItem, Order, Option } from "../types";
import OrderHistoryPane from "./OrderHistoryPane";
import OrderHeader from "./OrderHeader";
import CategoryNav from "./CategoryNav";
import MenuContent from "./MenuContent";
import CartSidebar from "./CartSidebar";
import OptionModal from "./OptionModal";
import BottomNav from "./BottomNav";

export type NavTab = "TOP" | "ORDER" | "HISTORY";

// Propsの型定義は変更なし
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

const getCategories = (menuItems: MenuItem[]): string[] => {
  const categories = new Set(menuItems.map((item) => item.category));
  return ["Pick up", ...Array.from(categories)];
};

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
      <OrderHeader
        userId={props.userId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCallStaff={props.onCallStaff}
      />

      <div
        className={`order-main-area ${
          props.activeTab === "HISTORY" ? "history-layout" : ""
        }`}
      >
        {renderMainContent()}
      </div>

      <BottomNav
        activeTab={props.activeTab}
        onNavigate={props.onNavigate}
        cartItemCount={props.cart.reduce((acc, item) => acc + item.quantity, 0)}
      />

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
