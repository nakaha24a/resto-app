/* src/components/OrderScreen.tsx - 修正版 */
import React, { useMemo, useState, useEffect } from "react";
import useCartStore, {
  useCartTotalAmount,
  useTotalBillAmount,
} from "../store/cartStore";
import { MenuData, Category } from "../types";

import OrderHistoryPane from "./OrderHistoryPane";
import OrderHeader from "./OrderHeader";
import CategoryNav from "./CategoryNav";
import MenuContent from "./MenuContent";
import CartSidebar from "./CartSidebar";
import BottomNav from "./BottomNav";
import TopScreen from "./TopScreen";

export type NavTab = "TOP" | "ORDER" | "HISTORY";

interface OrderScreenProps {
  userId: string;
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onGoToPayment: () => void;
  setConfirmationMessage: (message: string) => void;
  onCallStaff: (message: string) => void;
}

// カテゴリ取得ロジック
const getCategories = (menuData: MenuData | null): string[] => {
  if (!menuData || !Array.isArray(menuData.categories)) return [];

  const categoryNames = menuData.categories.map((c: Category) => c.name);
  const uniqueNames = Array.from(new Set(categoryNames));

  // "TOP" は除外
  const filtered = uniqueNames.filter((n) => n !== "TOP");

  // おすすめメニューが存在するかチェック
  const hasRecommended = menuData.categories
    .flatMap((c) => c.items)
    .some((item) => item.isRecommended);

  // おすすめがあれば先頭に追加
  if (hasRecommended && !filtered.includes("おすすめ")) {
    return ["おすすめ", ...filtered];
  }

  return filtered;
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

  // おすすめ商品リスト
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

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // ★ 修正: カテゴリ選択の自動補正ロジックを強化
  useEffect(() => {
    if (!menuLoading && menuData && CATEGORIES.length > 0) {
      // まだカテゴリが選ばれていない、または無効なカテゴリが選ばれている場合
      if (!selectedCategory || !CATEGORIES.includes(selectedCategory)) {
        // 「おすすめ」があればそれを、なければリストの先頭を選ぶ
        const initialCategory = CATEGORIES.includes("おすすめ")
          ? "おすすめ"
          : CATEGORIES[0];

        // 念のため、空でないことを確認してセット
        if (initialCategory) {
          setSelectedCategory(initialCategory);
        }
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

    // TOP画面
    if (activeTab === "TOP") {
      return (
        <TopScreen
          categories={CATEGORIES}
          recommendations={recommendedItems}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            onNavigate("ORDER");
          }}
          onCallStaff={(msg) => onCallStaff(msg)}
        />
      );
    }

    // メニュー画面
    if (activeTab === "ORDER") {
      // ★念のためここでもカテゴリがない場合のガードを入れる
      const activeCategory =
        selectedCategory || (CATEGORIES.length > 0 ? CATEGORIES[0] : "");

      return (
        <>
          <div className="main-content-wrapper">
            <CategoryNav
              categories={CATEGORIES}
              selectedCategory={activeCategory}
              onSelectCategory={setSelectedCategory}
            />
            <MenuContent
              selectedCategory={activeCategory}
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

    // 履歴画面
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
        onNavigate={(tab) => {
          if (tab === "ORDER") {
            // メニュー画面に行くとき、カテゴリ未選択なら初期値をセット
            if (!selectedCategory && CATEGORIES.length > 0) {
              const defaultCat = CATEGORIES.includes("おすすめ")
                ? "おすすめ"
                : CATEGORIES[0];
              setSelectedCategory(defaultCat);
            }
          }
          onNavigate(tab);
        }}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />
    </div>
  );
};

export default OrderScreen;
