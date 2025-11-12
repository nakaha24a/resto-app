import React, { useMemo, useState, useEffect } from "react";
import useCartStore, {
  useCartTotalAmount,
  usePendingOrderTotalAmount,
} from "../store/cartStore";
import { MenuItem, CartItem, MenuData, Category } from "../types";

import OrderHistoryPane from "./OrderHistoryPane";
import OrderHeader from "./OrderHeader";
import CategoryNav from "./CategoryNav";
import MenuContent from "./MenuContent";
import CartSidebar from "./CartSidebar";
import BottomNav from "./BottomNav";

export type NavTab = "TOP" | "ORDER" | "HISTORY";

// (中略: OrderScreenProps, getCategories は変更なし)
interface OrderScreenProps {
  userId: string;
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onGoToPayment: () => void;
  setConfirmationMessage: (message: string) => void;
  onCallStaff: (message: string) => void;
}
const getCategories = (menuData: MenuData | null): string[] => {
  if (!menuData || !Array.isArray(menuData.categories)) {
    return ["TOP"];
  }
  const categoryNames = new Set(
    menuData.categories.flatMap((category: Category) => category.name)
  );
  const hasRecommended = menuData.categories.some((cat: Category) =>
    cat.items.some((item: MenuItem) => item.isRecommended)
  );
  return [
    "TOP",
    ...(hasRecommended ? ["おすすめ"] : []),
    ...Array.from(categoryNames),
  ];
};
// (中略ここまで)

const OrderScreen: React.FC<OrderScreenProps> = ({
  userId,
  activeTab,
  onNavigate,
  onGoToPayment,
  setConfirmationMessage,
  onCallStaff,
}) => {
  const { cart, pendingOrders, placeOrder, fetchOrders } = useCartStore();
  const cartTotalAmount = useCartTotalAmount();
  const pendingOrderTotalAmount = usePendingOrderTotalAmount(); // ★ 修正: menuLoading をストアから取得

  const menuData = useCartStore((state) => state.menuData);
  const menuLoading = useCartStore((state) => state.menuLoading); // ★ 修正: loading -> menuLoading
  const menuError = useCartStore((state) => state.error);

  const tableNum = useMemo(() => {
    return parseInt(userId.replace(/[^0-9]/g, ""), 10);
  }, [userId]); /* // ★ App.tsx で menuData を読み込むため、この useEffect は削除
  useEffect(() => {
    if (!menuData && !menuLoading) {
      fetchMenuData();
    }
  }, [fetchMenuData, menuData, menuLoading]);
  */ // ★ 履歴取得の useEffect はそのまま

  useEffect(() => {
    if (tableNum && !isNaN(tableNum)) {
      fetchOrders(tableNum);
    }
  }, [fetchOrders, tableNum]);

  const CATEGORIES = useMemo(() => getCategories(menuData), [menuData]);
  const [selectedCategory, setSelectedCategory] = useState<string>("TOP");
  const [searchQuery, setSearchQuery] = useState(""); // ★ 修正: loading -> menuLoading

  useEffect(() => {
    if (
      !menuLoading &&
      menuData &&
      CATEGORIES.length > 0 &&
      !CATEGORIES.includes(selectedCategory)
    ) {
      setSelectedCategory("TOP");
    } else if (!menuLoading && !menuData && !menuError) {
      setSelectedCategory("TOP");
    }
  }, [CATEGORIES, selectedCategory, menuLoading, menuData, menuError]); // (中略: handlePlaceOrder は変更なし)

  const handlePlaceOrder = async () => {
    if (isNaN(tableNum) || tableNum <= 0) {
      setConfirmationMessage(`テーブル番号が無効です。(ID: ${userId})`);
      return;
    }
    const newOrder = await placeOrder(tableNum);
    if (newOrder) {
      setConfirmationMessage("ご注文を承りました");
    } else {
      const storeError = useCartStore.getState().error;
      setConfirmationMessage(`注文処理に失敗しました。\n${storeError || ""}`);
    }
  }; // (中略ここまで)
  const renderMainContent = () => {
    // ★ 修正: loading -> menuLoading
    if (menuLoading && !menuData)
      return (
        <div
          className="loading-message"
          style={{ padding: "20px", flex: 1, textAlign: "center" }}
        >
                    メニュー読み込み中...        {" "}
        </div>
      );
    if (menuError)
      return (
        <div
          className="error-message"
          style={{ color: "red", padding: "20px", flex: 1 }}
        >
                    エラー: {menuError}       {" "}
        </div>
      );
    if (!menuData)
      return (
        <div
          className="loading-message"
          style={{ padding: "20px", flex: 1, textAlign: "center" }}
        >
                    メニューデータがありません。        {" "}
        </div>
      ); // (中略: renderMainContent の残りは変更なし)

    if (activeTab === "ORDER" || activeTab === "TOP") {
      return (
        <>
                   {" "}
          <div className="main-content-wrapper">
                       {" "}
            <CategoryNav
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
                       {" "}
            <MenuContent
              selectedCategory={
                selectedCategory === "TOP" ? null : selectedCategory
              }
              searchQuery={searchQuery}
            />
                     {" "}
          </div>
                   {" "}
          <CartSidebar
            cart={cart}
            totalAmount={cartTotalAmount}
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
          onCallStaff={() => onCallStaff("スタッフを呼び出しました")}
        />
      );
    }
    return null;
  }; // (中略ここまで) // (中略: return (...) の JSX は変更なし)
  return (
    <div className="order-screen-layout">
           {" "}
      <OrderHeader
        userId={userId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCallStaff={() => onCallStaff("スタッフを呼び出しました")}
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
        cartItemCount={cart.reduce(
          (sum: number, item: CartItem) => sum + item.quantity,
          0
        )}
      />
         {" "}
    </div>
  );
};

export default OrderScreen;
