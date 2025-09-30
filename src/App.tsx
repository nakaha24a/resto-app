// src/App.tsx

import React, { useState, useMemo, useCallback } from "react";
import "./styles.css"; // 全体のスタイル

// 画面コンポーネント
import TitleScreen from "./components/TitleScreen";
import PartyInputScreen from "./components/PartyInputScreen"; // 席番号入力
import OrderScreen, { NavTab } from "./components/OrderScreen";
import CartScreen from "./components/CartScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import CompleteScreen from "./components/CompleteScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import "./components/styles.css";

// 型定義
import { Screen, MenuItem, CartItem, Order } from "./types";

// ダミーデータ
const DUMMY_MENU_ITEMS: MenuItem[] = [
  {
    id: "M001",
    name: "マルゲリータ",
    price: 1200,
    description: "定番のトマトソースとモッツァレラ",
    category: "Pick up",
    imageUrl: "/images/pizza.webp",
  },
  {
    id: "M002",
    name: "シーザーサラダ",
    price: 850,
    description: "シャキシャキのレタスと自家製ドレッシング",
    category: "サラダ",
    imageUrl: "/images/caesar.webp",
  },
  {
    id: "M003",
    name: "魚介のパスタ",
    price: 1580,
    description: "新鮮な魚介とトマトクリームソース",
    category: "パスタ",
    imageUrl: "/images/seafood_pasta.webp",
  },
  {
    id: "M004",
    name: "フォンダンショコラ",
    price: 650,
    description: "温かい濃厚チョコケーキ",
    category: "デザート",
    imageUrl: "/images/chocolate.webp",
  },
  {
    id: "M005",
    name: "アイスコーヒー",
    price: 400,
    description: "すっきりとした味わいのアイスコーヒー",
    category: "ドリンク",
    imageUrl: "/images/coffee.webp",
  },
  {
    id: "M006",
    name: "おすすめピザ",
    price: 1450,
    description: "シェフの気まぐれピザ",
    category: "Pick up",
    imageUrl: "/images/special_pizza.webp",
  },
  // その他省略
];

const TABLET_ID = "T-01"; // タブレット固有のID（初期画面表示用）

const App: React.FC = () => {
  // ----------------------------------------------------
  // ステート管理
  // ----------------------------------------------------
  const [currentScreen, setCurrentScreen] = useState<Screen>("TITLE");
  const [tableNumber, setTableNumber] = useState<string>(""); // 席番号 (PARTY_INPUTで設定)
  const [cart, setCart] = useState<CartItem[]>([]); // 現在のカート内容
  const [activeTab, setActiveTab] = useState<NavTab>("ORDER"); // OrderScreen内のアクティブタブ
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]); // 過去の注文履歴

  // 注文が確定した最後の注文（CompleteScreen表示用）
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // ----------------------------------------------------
  // 計算ロジック
  // ----------------------------------------------------

  // カートの合計金額を計算
  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // 注文履歴の合計金額（お会計画面用 - 今回はカートの合計を使用）
  const orderHistoryTotalAmount = useMemo(() => {
    return pendingOrders.reduce((total, order) => total + order.totalAmount, 0);
  }, [pendingOrders]);

  // ----------------------------------------------------
  // ハンドラ関数
  // ----------------------------------------------------

  // 1. 席番号入力完了
  const handleStartOrder = useCallback((num: string) => {
    setTableNumber(num);
    setCurrentScreen("ORDER");
    setActiveTab("ORDER");
  }, []);

  // 2. カートの数量更新
  const handleUpdateCart = useCallback(
    (menuItemId: string, newQuantity: number) => {
      const menuItem = DUMMY_MENU_ITEMS.find((item) => item.id === menuItemId);

      if (!menuItem) return;

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.menuItemId === menuItemId
        );

        if (existingItem) {
          if (newQuantity > 0) {
            // 既存アイテムの数量を更新
            return prevCart.map((item) =>
              item.menuItemId === menuItemId
                ? { ...item, quantity: newQuantity }
                : item
            );
          } else {
            // 数量が0以下ならカートから削除
            return prevCart.filter((item) => item.menuItemId !== menuItemId);
          }
        } else if (newQuantity > 0) {
          // 新しいアイテムを追加
          return [
            ...prevCart,
            {
              id: menuItem.id, // CartItem の id は MenuItem の id と同じで簡略化
              menuItemId: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              quantity: newQuantity,
            },
          ];
        }
        return prevCart;
      });
    },
    []
  );

  // 3. 注文確定（CheckoutScreenから呼び出される）
  const handlePlaceOrder = useCallback(() => {
    if (cart.length === 0 || tableNumber === "") return;

    const newOrder: Order = {
      id: Date.now().toString(), // ユニークな注文ID
      tableNumber: tableNumber,
      items: cart,
      totalAmount: totalAmount,
      timestamp: Date.now(),
    };

    // 注文履歴に追加し、カートをクリア
    setPendingOrders((prevOrders) => [newOrder, ...prevOrders]);
    setCart([]);
    setLastOrder(newOrder); // 完了画面表示用
    setCurrentScreen("COMPLETE");
  }, [cart, tableNumber, totalAmount]);

  // 4. スタッフ呼び出し（OrderScreen/SplitBillScreenから）
  const handleCallStaff = useCallback(() => {
    alert("スタッフを呼び出しています...🛎️");
    // 実際にはAPIコール
  }, []);

  // 5. お会計に進む（Historyタブから/Cartから）
  const handleGoToPayment = useCallback(() => {
    // 注文履歴があれば会計オプションへ、なければスタッフ呼び出しを促すなど
    // 今回は直接SPLIT_BILLへ進むか、お会計の合計金額を表示する画面を経由
    setCurrentScreen("SPLIT_BILL"); // 直接割り勘画面へ
  }, []);

  // ----------------------------------------------------
  // 画面レンダリング
  // ----------------------------------------------------
  const renderScreen = () => {
    switch (currentScreen) {
      case "TITLE":
        return (
          <TitleScreen
            onStart={() => setCurrentScreen("PARTY_INPUT")}
            tabletId={TABLET_ID}
          />
        );

      case "PARTY_INPUT":
        return <PartyInputScreen onStartOrder={handleStartOrder} />;

      case "ORDER":
        return (
          <OrderScreen
            userId={tableNumber} // 席番号をユーザーIDとして利用
            menuItems={DUMMY_MENU_ITEMS}
            cart={cart}
            totalAmount={totalAmount}
            onUpdateCart={handleUpdateCart}
            onConfirmOrder={() => setCurrentScreen("CART")}
            onCallStaff={handleCallStaff}
            onGoToPayment={handleGoToPayment}
            onNavigate={setActiveTab}
            activeTab={activeTab}
            pendingOrderCount={pendingOrders.length}
          />
        );

      case "CART":
        return (
          <CartScreen
            cart={cart}
            onUpdateCart={handleUpdateCart}
            onGoToCheckout={() => setCurrentScreen("CHECKOUT")}
            onBackToOrder={() => setCurrentScreen("ORDER")}
          />
        );

      case "CHECKOUT":
        return (
          <CheckoutScreen
            orderItems={cart}
            onPlaceOrder={handlePlaceOrder}
            onBackToOrder={() => setCurrentScreen("CART")}
          />
        );

      case "COMPLETE":
        return (
          <CompleteScreen
            order={lastOrder}
            status="確定済み"
            onGoBack={() => {
              setCurrentScreen("ORDER");
              setActiveTab("ORDER"); // メインの注文タブに戻す
            }}
          />
        );

      case "SPLIT_BILL":
        return (
          <SplitBillScreen
            // 会計対象は「過去の注文合計 + カートの合計」とすべきだが、今回はカートの合計で簡略化
            totalAmount={totalAmount + orderHistoryTotalAmount} // 全ての未会計分
            onCallStaff={handleCallStaff}
            onBack={() => setCurrentScreen("ORDER")}
          />
        );

      default:
        return <div>404: 画面が見つかりません</div>;
    }
  };

  // アプリケーション全体コンテナ
  return <div className="app-container">{renderScreen()}</div>;
};

export default App;
