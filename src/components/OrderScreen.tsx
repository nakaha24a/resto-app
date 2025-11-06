// src/components/OrderScreen.tsx

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
// OptionModal は MenuContent で使うのでここでは不要
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
  const { cart, pendingOrders, placeOrder, fetchOrders } = useCartStore();
  const cartTotalAmount = useCartTotalAmount();
  const pendingOrderTotalAmount = usePendingOrderTotalAmount();

  const menuData = useCartStore((state) => state.menuData);
  const fetchMenuData = useCartStore((state) => state.fetchMenuData);
  const menuLoading = useCartStore((state) => state.loading);
  const menuError = useCartStore((state) => state.error);

  useEffect(() => {
    if (!menuData && !menuLoading) {
      fetchMenuData();
    }
  }, [fetchMenuData, menuData, menuLoading]);

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
      setSelectedCategory("TOP");
    }
  }, [CATEGORIES, selectedCategory, menuLoading, menuData, menuError]);

  // ★★★ ここを修正しました ★★★
  const handlePlaceOrder = async () => {
    // "T-05" のような形式から数値 "5" を抽出
    const tableNum = parseInt(userId.replace(/[^0-9]/g, ""), 10);

    // 抽出した数値が有効か (NaN でないか、0より大きいか) をチェック
    if (isNaN(tableNum) || tableNum <= 0) {
      alert(`テーブル番号が無効です。(ID: ${userId})`); // エラーアラート
      return;
    }

    // 正常な数値 (tableNum) を placeOrder に渡す
    const newOrder = await placeOrder(tableNum);

    if (newOrder) {
      setShowOrderComplete(true);
      setTimeout(() => setShowOrderComplete(false), 1000);
    } else {
      // ストアからエラーメッセージを取得して表示
      const storeError = useCartStore.getState().error;
      alert(`注文処理に失敗しました。\n${storeError || ""}`);
    }
  };

  const renderMainContent = () => {
    if (menuLoading)
      return <div className="loading-message">メニュー読み込み中...</div>;
    if (menuError)
      return (
        <div
          className="error-message"
          style={{ color: "red", padding: "20px" }}
        >
          エラー: {menuError}
        </div>
      );
    if (!menuData)
      return (
        <div className="loading-message">メニューデータがありません。</div>
      );

    if (activeTab === "ORDER" || activeTab === "TOP") {
      return (
        // ★★★ この <React.Fragment> (または <>) が重要 ★★★
        <>
          {/* ★ メインコンテンツ(カテゴリ+メニュー)を div でラップ */}
          <div className="main-content-wrapper">
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
          </div>

          {/* ★ CartSidebar は .main-content-wrapper の *外* (兄弟要素) に出す */}
          <CartSidebar
            cart={cart}
            totalAmount={cartTotalAmount}
            onPlaceOrder={handlePlaceOrder}
            onGoToPayment={onGoToPayment}
            pendingOrderTotalAmount={pendingOrderTotalAmount}
          />
        </>
        // ★★★ ここまでが変更点 ★★★
      );
    } else if (activeTab === "HISTORY") {
      // (ここは変更なし)
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
