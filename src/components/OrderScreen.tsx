/* src/components/OrderScreen.tsx */
import React, { useMemo, useState, useEffect } from "react";
import useCartStore, {
  useCartTotalAmount,
  useTotalBillAmount,
} from "../store/cartStore";
import {
  MenuItem as MenuItemType,
  CartItem,
  MenuData,
  Category,
} from "../types";
// MenuItemはMenuContent内で使われているので、ここでは直接使わなくてもOKですが、エラー防止で残しても可
// import { MenuItem } from "./MenuItem";

import OrderHistoryPane from "./OrderHistoryPane";
import OrderHeader from "./OrderHeader";
import CategoryNav from "./CategoryNav";
import MenuContent from "./MenuContent";
import CartSidebar from "./CartSidebar";
import BottomNav from "./BottomNav";
import TopScreen from "./TopScreen"; // ★追加: ポータル画面

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
  if (!menuData || !Array.isArray(menuData.categories)) return ["TOP"];
  const categoryNames = menuData.categories.map((c: Category) => c.name);
  const uniqueNames = Array.from(new Set(categoryNames)).filter(
    (n) => n !== "TOP"
  );
  // カテゴリリストとしては "TOP" を先頭にしておく
  return ["TOP", ...uniqueNames];
};

const OrderScreen: React.FC<OrderScreenProps> = ({
  userId,
  activeTab,
  onNavigate,
  onGoToPayment,
  setConfirmationMessage,
  onCallStaff,
}) => {
  const { cart, orders, placeOrder, fetchOrders } = useCartStore();

  const cartTotalAmount = useCartTotalAmount();
  const totalBillAmount = useTotalBillAmount();

  const menuData = useCartStore((state) => state.menuData);
  const menuLoading = useCartStore((state) => state.menuLoading);
  const menuError = useCartStore((state) => state.error);

  // ★追加: ポータル画面に渡す「おすすめ商品」リストを作成
  const recommendedItems = useMemo(() => {
    if (!menuData) return [];
    return menuData.categories
      .flatMap((c) => c.items)
      .filter((i) => i.isRecommended);
  }, [menuData]);

  const tableNum = useMemo(() => {
    const num = parseInt(userId.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }, [userId]);

  useEffect(() => {
    if (tableNum > 0) {
      fetchOrders(tableNum);
      const intervalId = setInterval(() => {
        fetchOrders(tableNum);
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [fetchOrders, tableNum]);

  const CATEGORIES = useMemo(() => getCategories(menuData), [menuData]);

  const [selectedCategory, setSelectedCategory] = useState<string>("TOP");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!menuLoading && menuData && CATEGORIES.length > 0) {
      if (!selectedCategory || !CATEGORIES.includes(selectedCategory)) {
        setSelectedCategory("TOP");
      }
    }
  }, [CATEGORIES, selectedCategory, menuLoading, menuData]);

  const handlePlaceOrder = async () => {
    if (tableNum <= 0) {
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
      return <div style={{ padding: "20px" }}>読み込み中...</div>;
    if (menuError)
      return (
        <div style={{ padding: "20px", color: "red" }}>エラー: {menuError}</div>
      );
    if (!menuData) return null;

    // ★修正1: "TOP"タブの時はポータル画面(TopScreen)を表示
    if (activeTab === "TOP") {
      return (
        <TopScreen
          categories={CATEGORIES}
          recommendations={recommendedItems}
          onSelectCategory={(cat) => {
            // カテゴリを選んだら、そのカテゴリを選択状態にしてORDER画面へ移動
            setSelectedCategory(cat);
            onNavigate("ORDER");
          }}
          onCallStaff={(msg) => onCallStaff(msg)}
        />
      );
    }

    // ★修正2: "ORDER"タブの時はいつものメニューリストを表示
    if (activeTab === "ORDER") {
      return (
        <>
          <div className="main-content-wrapper">
            <CategoryNav
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <MenuContent
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </div>
          <CartSidebar
            cart={cart}
            totalAmount={cartTotalAmount}
            onPlaceOrder={handlePlaceOrder}
            onGoToPayment={onGoToPayment}
            pendingOrderTotalAmount={totalBillAmount}
          />
        </>
      );
    }

    // ★修正3: 履歴画面
    if (activeTab === "HISTORY") {
      return (
        <OrderHistoryPane
          pendingOrders={orders}
          orderHistoryTotalAmount={totalBillAmount}
          onGoToPaymentView={onGoToPayment}
          onCallStaff={() => onCallStaff("スタッフを呼び出しました")}
        />
      );
    }
    return null;
  };

  return (
    <div className="order-screen-layout">
      {/* ヘッダーは全画面共通 */}
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
        // ★修正: TOPの時に "ORDER" と偽るのをやめて、そのまま渡す
        activeTab={activeTab}
        onNavigate={(tab) => {
          if (tab === "TOP") {
            // TOPボタンが押されたらTOPカテゴリに戻してTOP画面へ
            setSelectedCategory("TOP");
            onNavigate("TOP");
          } else {
            onNavigate(tab);
          }
        }}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />
    </div>
  );
};

export default OrderScreen;
