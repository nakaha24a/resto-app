import React from "react";

// ★ 追加: Props の型定義
interface ThanksScreenProps {
  onBackToTop: () => void;
}

const ThanksScreen: React.FC<ThanksScreenProps> = ({ onBackToTop }) => {
  return (
    <div
      className="screen thanks-screen"
      style={{ textAlign: "center", padding: "50px 20px" }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "20px" }}>😊</div>
      <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "10px" }}>
        ご利用ありがとうございました！
      </h2>
      <p style={{ color: "#666", marginBottom: "40px" }}>
        またのご来店を心よりお待ちしております。
      </p>

      <button
        className="back-to-top-btn"
        onClick={onBackToTop}
        style={{
          padding: "15px 30px",
          fontSize: "1.1rem",
          backgroundColor: "#f2994a",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        トップ画面へ戻る
      </button>
    </div>
  );
};

export default ThanksScreen;
