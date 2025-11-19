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
  const pendingOrderTotalAmount = usePendingOrderTotalAmount();

  const menuData = useCartStore((state) => state.menuData);
  const menuLoading = useCartStore((state) => state.menuLoading);
  const menuError = useCartStore((state) => state.error);

  // ★ 修正: 数値変換せず、userId (テーブルID) をそのまま使用する
  // 数値以外のID (例: "T-05") も許容するため parseInt を削除
  const tableNum = userId;

  // ★ 履歴取得の useEffect
  useEffect(() => {
    if (tableNum) {
      fetchOrders(tableNum);
    }
  }, [fetchOrders, tableNum]);

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
    // ★ 修正: 数値チェック (isNaN) を削除し、空文字チェックのみにする
    if (!tableNum) {
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
              searchQuery={searchQuery}
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
          onCallStaff={() => onCallStaff("スタッフを呼び出しました")}
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
        onCallStaff={() => onCallStaff("スタッフを呼び出しました")}
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
