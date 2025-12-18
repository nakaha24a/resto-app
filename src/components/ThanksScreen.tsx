import React, { useState, useEffect } from "react";

interface ThanksScreenProps {
  onBackToTop: () => void;
}

const ThanksScreen: React.FC<ThanksScreenProps> = ({ onBackToTop }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // 少し遅れてふわっと表示
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>
        {`
        /* ========= 全体レイアウト ========= */
        .thanks-wrapper {
          width: 100%;
          height: 100%;
          min-height: 100vh;
          /* 清潔感のあるオフホワイト背景 */
          background-color: #f9fafb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
        }

        /* ========= カードデザイン ========= */
        .thanks-card {
          background: #ffffff;
          width: 100%;
          max-width: 500px;
          padding: 60px 40px;
          border-radius: 24px;
          /* 柔らかく広がる影で浮遊感を出す */
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .thanks-card.show {
          opacity: 1;
          transform: translateY(0);
        }

        /* ========= アイコン ========= */
        .icon-container {
          width: 80px;
          height: 80px;
          margin: 0 auto 30px;
          border-radius: 50%;
          background-color: #fff7ed; /* 薄いオレンジ */
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff9f43; /* テーマカラー */
        }

        .check-icon {
          width: 40px;
          height: 40px;
          stroke-width: 3;
          stroke: currentColor;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: drawCheck 0.6s 0.4s ease forwards;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
        }

        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        /* ========= タイトル & テキスト ========= */
        .thanks-title {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 24px;
          letter-spacing: 0.05em;
          line-height: 1.3;
        }

        .thanks-message {
          font-size: 1rem;
          color: #6b7280;
          line-height: 2;
          margin-bottom: 40px;
        }

        /* ========= ボタン ========= */
        .thanks-button {
          width: 100%;
          padding: 18px;
          background-color: #111827; /* モダンな黒/ダークグレー */
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
          letter-spacing: 0.02em;
        }

        .thanks-button:hover {
          background-color: #000000;
          transform: translateY(-2px);
        }

        .thanks-button:active {
          transform: scale(0.98);
        }

        /* ========= フッター ========= */
        .thanks-footer {
          margin-top: 40px;
          font-size: 0.75rem;
          color: #9ca3af;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0;
          animation: fadeIn 1s 0.8s ease forwards;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        /* レスポンシブ対応 */
        @media (max-width: 480px) {
          .thanks-card {
            padding: 40px 24px;
            background: transparent;
            box-shadow: none;
          }
          .thanks-wrapper {
            background-color: #ffffff;
          }
        }
        `}
      </style>

      <div className="thanks-wrapper">
        <div className={`thanks-card ${showContent ? "show" : ""}`}>
          {/* アイコン */}
          <div className="icon-container">
            <svg className="check-icon" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* タイトル */}
          <h1 className="thanks-title">
            ご利用ありがとう
            <br />
            ございました
          </h1>

          {/* メッセージ（お会計後・退店時向け） */}
          <div className="thanks-message">
            <p>
              本日はご来店いただき
              <br />
              誠にありがとうございます。
            </p>
            <p style={{ marginTop: "16px" }}>
              またのお越しを
              <br />
              心よりお待ちしております。
            </p>
          </div>

          {/* ボタン */}
          <button className="thanks-button" onClick={onBackToTop}>
            トップ画面へ戻る
          </button>
        </div>

        {/* フッター */}
        <p className="thanks-footer">Thank you &amp; See you again</p>
      </div>
    </>
  );
};

export default ThanksScreen;
