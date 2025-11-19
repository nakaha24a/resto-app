import React, { useState, useEffect } from "react";
import useCartStore, { usePendingOrderTotalAmount } from "./store/cartStore";

// コンポーネントのインポート
import OrderScreen, { NavTab } from "./components/OrderScreen";
import SplitBillScreen from "./components/SplitBillScreen";
import ThanksScreen from "./components/ThanksScreen";

// 画面の定義に "TABLE_INPUT" を追加
type AppScreen = "TABLE_INPUT" | "ORDER" | "SPLIT_BILL" | "COMPLETE_PAYMENT";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("TABLE_INPUT");
  const [tableNumber, setTableNumber] = useState<string>(""); // 初期値は空
  const [inputTableNum, setInputTableNum] = useState(""); // 入力フォーム用
  const [activeOrderTab, setActiveOrderTab] = useState<NavTab>("ORDER");

  const { cart, clearCart, clearPendingOrders, fetchMenuData } = useCartStore();

  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );
  const pendingOrderTotalAmount = usePendingOrderTotalAmount();

  // ① アプリ起動時にURLパラメータまたはローカルストレージからテーブル番号を探す
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableQuery = params.get("table");

    if (tableQuery) {
      // URLに ?table=T-01 があればそれを使う
      setTableNumber(tableQuery);
      setCurrentScreen("ORDER");
    } else {
      // URLになくても、入力待ち画面にする
      setCurrentScreen("TABLE_INPUT");
    }

    // メニューデータの取得
    fetchMenuData();
  }, [fetchMenuData]);

  // メッセージの自動消去
  useEffect(() => {
    if (confirmationMessage) {
      const timer = setTimeout(() => {
        setConfirmationMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [confirmationMessage]);

  // ② テーブル番号入力の確定処理
  const handleTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTableNum.trim()) return;
    setTableNumber(inputTableNum);
    setCurrentScreen("ORDER");
  };

  const handleBackToTitle = () => {
    clearCart();
    clearPendingOrders();
    setCurrentScreen("ORDER");
    setActiveOrderTab("ORDER");
  };

  const handleBackToOrderHistory = () => {
    setCurrentScreen("ORDER");
    setActiveOrderTab("HISTORY");
  };

  const handleNavigateOrderTab = (tab: NavTab) => setActiveOrderTab(tab);

  const handleGoToSplitBill = () => {
    if (pendingOrderTotalAmount === 0 && cart.length === 0) {
      setConfirmationMessage("商品がないため、お会計に進めません。");
      return;
    }
    setCurrentScreen("SPLIT_BILL");
  };

  const handleRequestPayment = (message: string) => {
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);
    clearCart();
    clearPendingOrders();
    setCurrentScreen("COMPLETE_PAYMENT");
  };

  const handleCallStaff = (message: string) => {
    console.log(`[STAFF CALL] ${tableNumber}: ${message}`);
    setConfirmationMessage(message);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // ★ テーブル番号入力画面
      case "TABLE_INPUT":
        return (
          <div style={styles.inputContainer}>
            <div style={styles.inputBox}>
              <h2>テーブル番号を入力</h2>
              <form onSubmit={handleTableSubmit} style={styles.form}>
                <input
                  type="text"
                  value={inputTableNum}
                  onChange={(e) => setInputTableNum(e.target.value)}
                  placeholder="例: T-01"
                  style={styles.input}
                  autoFocus
                />
                <button type="submit" style={styles.button}>
                  開始する
                </button>
              </form>
              <p style={{ fontSize: "12px", color: "#666", marginTop: "20px" }}>
                またはURLパラメータで指定:
                <br />
                /?table=T-05
              </p>
            </div>
          </div>
        );

      case "ORDER":
        return (
          <OrderScreen
            userId={tableNumber}
            activeTab={activeOrderTab}
            onNavigate={handleNavigateOrderTab}
            onGoToPayment={handleGoToSplitBill}
            setConfirmationMessage={setConfirmationMessage}
            onCallStaff={handleCallStaff}
          />
        );
      case "SPLIT_BILL":
        return (
          <SplitBillScreen
            onCallStaff={handleRequestPayment}
            onBack={handleBackToOrderHistory}
          />
        );
      case "COMPLETE_PAYMENT":
        return <ThanksScreen onBackToTitle={handleBackToTitle} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}

      {confirmationMessage && (
        <div className="confirmation-overlay">
          <div className="confirmation-box">
            {confirmationMessage.includes("承り") ? "✅" : "✋"}{" "}
            {confirmationMessage}
          </div>
        </div>
      )}
    </div>
  );
};

// 簡易スタイル
const styles = {
  inputContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  inputBox: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
    width: "90%",
    maxWidth: "400px",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    marginTop: "1rem",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#FF9800",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;
