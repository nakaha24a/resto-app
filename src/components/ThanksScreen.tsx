import React from "react";

interface ThanksScreenProps {
  onBackToTop: () => void;
}

const ThanksScreen: React.FC<ThanksScreenProps> = ({ onBackToTop }) => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#4ade80",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px",
          marginBottom: "30px",
        }}
      >
        ✓
      </div>

      <h1 style={{ fontSize: "2rem", marginBottom: "10px", color: "#333" }}>
        ありがとうございました
      </h1>
      <p style={{ color: "#666", marginBottom: "50px" }}>
        お会計が完了しました。
      </p>

      <button
        onClick={onBackToTop}
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "20px",
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: "#fff",
          backgroundColor: "#111",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        テーブル選択画面へ戻る
      </button>
    </div>
  );
};

export default ThanksScreen;
