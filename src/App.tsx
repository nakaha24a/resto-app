// src/App.tsx (修正完了版)

import React, { useState, useMemo } from "react";
// types.ts (または index.ts) に定義されている型をインポート
import { MenuItem, CartItem, Order, OrderItem } from "./types";

// コンポーネントのインポート
import TitleScreen from "./components/TitleScreen";
import OrderScreen, { NavTab } from "./components/OrderScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import CompleteScreen from "./components/CompleteScreen";
import PaymentOptionsScreen from "./components/PaymentOptionsScreen";
import SplitBillScreen from "./components/SplitBillScreen";

// スタイルシート
import "./components/styles.css";

// 画面遷移の状態
type AppScreen =
  | "TITLE"
  | "ORDER" // メイン画面 (注文、履歴タブを含む)
  | "CHECKOUT" // 注文最終確認画面 (全画面)
  | "COMPLETE_ORDER" // 注文完了画面 (全画面)
  | "PAYMENT_OPTIONS" // 会計選択画面 (全画面)
  | "SPLIT_BILL" // 割り勘計算画面 (全画面)
  | "COMPLETE_PAYMENT"; // 会計依頼完了画面 (全画面)

// ======================================
// MOCK DATA (メニュー、実際のシステムではAPIから取得)
// ======================================
const MOCK_MENU: MenuItem[] = [
  {
    id: "M001",
    name: "マルゲリータ",
    price: 1280,
    description: "定番のイタリアンピザ",
    category: "ピザ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=PIZZA",
  },
  {
    id: "M002",
    name: "シーザーサラダ",
    price: 880,
    description: "新鮮野菜とベーコン",
    category: "サラダ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=SALAD",
  },
  {
    id: "M003",
    name: "カルボナーラ",
    price: 1450,
    description: "濃厚なチーズと卵黄",
    category: "パスタ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=PASTA",
  },
  {
    id: "M004",
    name: "アイスコーヒー",
    price: 350,
    description: "さっぱりとしたアイス",
    category: "ドリンク",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=COFFEE",
  },
  {
    id: "M005",
    name: "ティラミス",
    price: 550,
    description: "ほろ苦い大人のデザート",
    category: "デザート",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=DESSERT",
  },
  {
    id: "M006",
    name: "海老とアボカドのサラダ",
    price: 980,
    description: "女性に人気の組み合わせ",
    category: "サラダ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=SHRIMP",
  },
  {
    id: "M007",
    name: "ペペロンチーノ",
    price: 1100,
    description: "ニンニクと唐辛子のオイルベース",
    category: "パスタ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=PEPERO",
  },
  {
    id: "M008",
    name: "オレンジジュース",
    price: 300,
    description: "果汁100%のフレッシュジュース",
    category: "ドリンク",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=OJ",
  },
];

const TABLE_ID = "T-05";

const App: React.FC = () => {
  // --- State管理 ---
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TITLE");
  const [tableNumber] = useState<string>(TABLE_ID);
  const [cart, setCart] = useState<CartItem[]>([]); // 現在のカート内容
  // 未会計の確定済み注文のリスト
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  // 完了画面表示用
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(
    null
  );
  // OrderScreen内のタブ
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER");

  // --- 計算値 ---
  const cartTotalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const pendingOrderTotalAmount = useMemo(() => {
    // 確定済み注文の合計金額を計算
    return pendingOrders.reduce(
      (orderTotal, order) =>
        orderTotal +
        order.items.reduce(
          (itemTotal, item) => itemTotal + item.price * item.quantity,
          0
        ),
      0
    );
  }, [pendingOrders]);

  // ======================================
  // 画面遷移ハンドラ
  // ======================================

  const handleStart = () => {
    // TitleScreenからメイン画面へ遷移
    setCurrentScreen("ORDER");
    setActiveOrderTab("ORDER");
  };

  const handleBackToOrderMenu = () => {
    // 注文画面 (ORDERタブ) に戻る
    setCurrentScreen("ORDER");
    setActiveOrderTab("ORDER");
  };

  const handleBackToOrderHistory = () => {
    // 注文画面 (HISTORYタブ) に戻る
    setCurrentScreen("ORDER");
    setActiveOrderTab("HISTORY");
  };

  // OrderScreen内のタブ切り替えを処理
  const handleNavigateOrderTab = (tab: NavTab) => {
    setActiveOrderTab(tab);
    // TOP, ORDER, HISTORYのタブ切り替えはAppScreen 'ORDER' に留まる
    setCurrentScreen("ORDER");
  };

  // ======================================
  // 注文ロジック
  // ======================================

  const handleUpdateCart = (menuItemId: string, newQuantity: number) => {
    const menuItem = MOCK_MENU.find((m) => m.id === menuItemId);
    if (!menuItem) return;

    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
    } else {
      setCart((prev) => {
        const existingItem = prev.find(
          (item) => item.menuItemId === menuItemId
        );
        if (existingItem) {
          return prev.map((item) =>
            item.menuItemId === menuItemId
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          const newCartItem: CartItem = {
            id: `C${Date.now()}`,
            menuItemId: menuItemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity: newQuantity,
          };
          return [...prev, newCartItem];
        }
      });
    }
  };

  const handleGoToCheckout = () => {
    if (cart.length > 0) {
      setCurrentScreen("CHECKOUT"); // 注文最終確認画面へ
    }
  };

  const handlePlaceOrder = () => {
    // CartItemをOrderItemに変換 (OrderItemはMenuItemの全情報+quantityを持つ)
    const orderItems: OrderItem[] = cart.map((cartItem) => {
      const menuItem = MOCK_MENU.find((m) => m.id === cartItem.menuItemId);

      // OrderItem型に不足しているMenuItemのプロパティを補完
      return {
        id: cartItem.menuItemId,
        name: cartItem.name,
        price: cartItem.price,
        description: menuItem?.description ?? "",
        category: menuItem?.category ?? "",
        imageUrl: menuItem?.imageUrl ?? "",
        quantity: cartItem.quantity,
      } as OrderItem; // OrderItem型を明示
    });

    const newOrder: Order = {
      id: `O${Date.now()}`,
      tableNumber: tableNumber,
      items: orderItems,
      totalAmount: cartTotalAmount, // OrderインターフェースにtotalAmountとtimestampが必要
      timestamp: Date.now(),
    };

    // 2. 注文履歴に追加 (未会計リスト)
    setPendingOrders((prev) => [...prev, newOrder]);

    // 3. カートをリセット
    setCart([]);

    // 4. 注文完了画面へ遷移
    setLastCompletedOrder(newOrder);
    setCurrentScreen("COMPLETE_ORDER");
  };

  // ======================================
  // 会計ロジック
  // ======================================

  const handleGoToPaymentOptions = () => {
    // 注文または履歴画面から、会計選択画面へ
    if (pendingOrders.length === 0) {
      // 🚨 alert() の代わりにカスタムUIを使用することが推奨されますが、
      // ここではロジックの確認のためconsole.logとreturnを使用
      console.log("確定済みのご注文がないため、お会計に進めません。");
      return;
    }
    setCurrentScreen("PAYMENT_OPTIONS");
  };

  const handleGoToSplitBill = () => {
    // 会計選択画面から、割り勘計算画面へ
    setCurrentScreen("SPLIT_BILL");
  };

  const handleCallStaff = (message: string) => {
    // 1. スタッフ呼び出し処理 (APIコールをシミュレート)
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);

    // 2. 会計依頼完了画面へ遷移し、未会計リストをクリア
    setLastCompletedOrder({
      id: `P${Date.now()}`, // Payment IDとして使用
      tableNumber: tableNumber,
      items: [],
      totalAmount: pendingOrderTotalAmount,
      timestamp: Date.now(),
    });
    setPendingOrders([]); // 会計処理が始まったら、未会計リストをクリア
    setCurrentScreen("COMPLETE_PAYMENT");
  };

  // ======================================
  // 画面レンダリング
  // ======================================

  const renderScreen = () => {
    switch (currentScreen) {
      case "TITLE":
        return <TitleScreen onStart={handleStart} tabletId={tableNumber} />;

      case "ORDER":
        return (
          <OrderScreen
            userId={tableNumber}
            menuItems={MOCK_MENU}
            cart={cart}
            totalAmount={cartTotalAmount}
            onUpdateCart={handleUpdateCart}
            onConfirmOrder={handleGoToCheckout} // 注文確認画面へ
            onCallStaff={() =>
              handleCallStaff(`スタッフ呼び出し (${tableNumber})`)
            }
            onGoToPayment={handleGoToPaymentOptions} // 会計オプション画面へ
            onNavigate={handleNavigateOrderTab}
            activeTab={activeOrderTab}
            pendingOrderCount={pendingOrders.length}
            // 履歴タブに必要な情報を渡す
            pendingOrders={pendingOrders}
            pendingOrderTotalAmount={pendingOrderTotalAmount}
          />
        );

      case "CHECKOUT":
        return (
          <CheckoutScreen
            orderItems={cart}
            onPlaceOrder={handlePlaceOrder} // 注文確定
            onBackToOrder={handleBackToOrderMenu}
          />
        );

      case "COMPLETE_ORDER":
        return (
          <CompleteScreen
            order={lastCompletedOrder}
            status="ORDER" // 注文完了
            onGoBack={handleBackToOrderMenu}
          />
        );

      case "PAYMENT_OPTIONS":
        return (
          <PaymentOptionsScreen
            totalAmount={pendingOrderTotalAmount}
            onGoToSplitBill={handleGoToSplitBill}
            onCallStaff={() =>
              handleCallStaff(`会計依頼: 現金/カード (${tableNumber})`)
            } // 会計依頼完了へ遷移
            onBack={handleBackToOrderHistory} // 履歴タブに戻る
          />
        );

      case "SPLIT_BILL":
        return (
          <SplitBillScreen
            totalAmount={pendingOrderTotalAmount}
            onCallStaff={() =>
              handleCallStaff(`会計依頼: 割り勘希望 (${tableNumber})`)
            } // 会計依頼完了へ遷移
            onBack={handleGoToPaymentOptions} // 会計オプション画面に戻る
          />
        );

      case "COMPLETE_PAYMENT":
        return (
          <CompleteScreen
            order={lastCompletedOrder}
            status="PAYMENT" // 会計依頼完了
            onGoBack={handleBackToOrderHistory} // 履歴タブに戻る
          />
        );

      default:
        return <TitleScreen onStart={handleStart} tabletId={TABLE_ID} />;
    }
  };

  return <div className="app-container">{renderScreen()}</div>;
};

export default App;
