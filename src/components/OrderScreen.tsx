// src/components/OrderScreen.tsx

import React, { useMemo, useState, useEffect } from "react";
// ★ usePendingOrderTotalAmount のみインポート
import useCartStore, {
  useCartTotalAmount,
  usePendingOrderTotalAmount,
} from "../store/cartStore";
// ★ Option, Order のインポートを削除
import { MenuItem, CartItem, MenuData, Category } from "../types";

import OrderHistoryPane from "./OrderHistoryPane";
import OrderHeader from "./OrderHeader";
import CategoryNav from "./CategoryNav";
import MenuContent from "./MenuContent";
import CartSidebar from "./CartSidebar";
import BottomNav from "./BottomNav";

export type NavTab = "TOP" | "ORDER" | "HISTORY";

interface OrderScreenProps {
  userId: string;
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onGoToPayment: () => void;
  setShowOrderComplete: (show: boolean) => void;
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

const OrderScreen: React.FC<OrderScreenProps> = ({
  userId,
  activeTab,
  onNavigate,
  onGoToPayment,
  setShowOrderComplete,
}) => {
  // ★ updateCart の取得を削除
  const { cart, pendingOrders, placeOrder, fetchOrders } = useCartStore();
  const cartTotalAmount = useCartTotalAmount();
  const pendingOrderTotalAmount = usePendingOrderTotalAmount();

  // ★ ストアのメニューデータを取得
  const menuData = useCartStore((state) => state.menuData);
  const fetchMenuData = useCartStore((state) => state.fetchMenuData);
  const menuLoading = useCartStore((state) => state.loading);
  const menuError = useCartStore((state) => state.error);

  useEffect(() => {
    if (!menuData && !menuLoading) {
      // データがなく、ローディング中でもない場合のみ取得
      fetchMenuData();
    }
  }, [fetchMenuData, menuData, menuLoading]); // ★ menuLoading も依存配列に追加

  // ★ fetchOrders 呼び出しを別 useEffect に分離 (menuData の変更で再実行しないように)
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const CATEGORIES = useMemo(() => getCategories(menuData), [menuData]);
  const [selectedCategory, setSelectedCategory] = useState<string>("TOP");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (
      !menuLoading &&
      menuData &&
      CATEGORIES.length > 0 &&
      !CATEGORIES.includes(selectedCategory)
    ) {
      setSelectedCategory("TOP");
    } else if (!menuLoading && !menuData && !menuError) {
      // データロード失敗(エラーなし)の場合
      setSelectedCategory("TOP");
    }
  }, [CATEGORIES, selectedCategory, menuLoading, menuData, menuError]); // ★ menuError も依存配列に追加

  const handlePlaceOrder = async () => {
    const tableNum = parseInt(userId, 10);
    if (isNaN(tableNum)) {
      alert("テーブル番号が無効です。");
      return;
    }
    const newOrder = await placeOrder(tableNum);
    if (newOrder) {
      setShowOrderComplete(true);
      setTimeout(() => setShowOrderComplete(false), 2500);
    } else {
      const storeError = useCartStore.getState().error;
      alert(`注文処理に失敗しました。\n${storeError || ""}`);
    }
  };

  const renderMainContent = () => {
    if (menuLoading)
      return <div className="loading-message">メニュー読み込み中...</div>;
    // エラー時はメッセージのみ表示
    if (menuError)
      return (
        <div
          className="error-message"
          style={{ color: "red", padding: "20px" }}
        >
          エラー: {menuError}
        </div>
      );
    // データがない場合 (エラーではないが空)
    if (!menuData)
      return (
        <div className="loading-message">メニューデータがありません。</div>
      );

    if (activeTab === "ORDER" || activeTab === "TOP") {
      return (
        <>
          <CategoryNav
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <MenuContent
            selectedCategory={
              selectedCategory === "TOP" ? null : selectedCategory
            }
          />
          <CartSidebar
            cart={cart}
            totalAmount={cartTotalAmount}
            // onUpdateCart は CartSidebar 内でストアを使うので不要
            onPlaceOrder={handlePlaceOrder}
            onGoToPayment={onGoToPayment}
            pendingOrderTotalAmount={pendingOrderTotalAmount}
          />
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
      <OrderHeader
        userId={userId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCallStaff={() => alert("スタッフを呼び出しました。")}
      />
      <div
        className={`order-main-area ${
          activeTab === "HISTORY" ? "history-layout" : ""
        }`}
      >
        {renderMainContent()}
      </div>
      <BottomNav
        activeTab={activeTab}
        onNavigate={onNavigate}
        cartItemCount={cart.reduce(
          (sum: number, item: CartItem) => sum + item.quantity,
          0
        )}
      />
    </div>
  );
};

export default OrderScreen;
