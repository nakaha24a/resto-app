// src/components/OrderScreen.tsx

import React, { useMemo, useState, useEffect } from "react";
// ★ usePendingOrderTotalAmount のみインポート
import useCartStore, {
  useCartTotalAmount,
  usePendingOrderTotalAmount,
} from "../store/cartStore";
// ★ Option, Order のインポートを削除 (ESLint警告対応)
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

// カテゴリリストを取得するヘルパー関数
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
  // ★ updateCart の取得を削除 (ESLint警告対応)
  const { cart, pendingOrders, placeOrder, fetchOrders } = useCartStore();
  const cartTotalAmount = useCartTotalAmount();
  const pendingOrderTotalAmount = usePendingOrderTotalAmount();

  // ★ ストアのメニューデータを取得
  const menuData = useCartStore((state) => state.menuData);
  const fetchMenuData = useCartStore((state) => state.fetchMenuData);
  const menuLoading = useCartStore((state) => state.loading);
  const menuError = useCartStore((state) => state.error);

  // ★★★ tableNum の定義をここに移動 ★★★
  // useMemo を使って、userId が変わった時だけ再計算するようにすると効率的
  const tableNum = useMemo(() => {
    return parseInt(userId.replace(/[^0-9]/g, ""), 10);
  }, [userId]);
  // ★★★ 修正ここまで ★★★

  useEffect(() => {
    if (!menuData && !menuLoading) {
      fetchMenuData();
    }
  }, [fetchMenuData, menuData, menuLoading]);

  // ★ fetchOrders を呼び出す useEffect
  useEffect(() => {
    // ★ tableNum が有効な数値の場合のみ fetchOrders を呼び出す
    if (tableNum && !isNaN(tableNum)) {
      fetchOrders(tableNum);
    }
  }, [fetchOrders, tableNum]); // ★ 依存配列に tableNum を追加

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

  const handlePlaceOrder = async () => {
    // ★ tableNum が有効か再度チェック (handlePlaceOrder でも tableNum を使う)
    if (isNaN(tableNum) || tableNum <= 0) {
      alert(`テーブル番号が無効です。(ID: ${userId})`);
      return;
    }

    const newOrder = await placeOrder(tableNum); // ★ ここでも tableNum を使用

    if (newOrder) {
      setShowOrderComplete(true);
      setTimeout(() => setShowOrderComplete(false), 1500); // 表示時間を1.5秒に変更
    } else {
      const storeError = useCartStore.getState().error;
      alert(`注文処理に失敗しました。\n${storeError || ""}`);
    }
  };

  const renderMainContent = () => {
    if (menuLoading && !menuData)
      return (
        <div
          className="loading-message"
          style={{ padding: "20px", flex: 1, textAlign: "center" }}
        >
          メニュー読み込み中...
        </div>
      );
    if (menuError)
      return (
        <div
          className="error-message"
          style={{ color: "red", padding: "20px", flex: 1 }}
        >
          エラー: {menuError}
        </div>
      );
    if (!menuData)
      return (
        <div
          className="loading-message"
          style={{ padding: "20px", flex: 1, textAlign: "center" }}
        >
          メニューデータがありません。
        </div>
      );

    if (activeTab === "ORDER" || activeTab === "TOP") {
      return (
        <>
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
              searchQuery={searchQuery} // 検索キーワードを MenuContent に渡す
            />
          </div>

          <CartSidebar
            cart={cart}
            totalAmount={cartTotalAmount}
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
        onSearchChange={setSearchQuery} // ヘッダーの入力で searchQuery が更新される
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
