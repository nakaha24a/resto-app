// src/components/TitleScreen.tsx (修正)

import React, { useState } from "react";

interface TitleScreenProps {
  onStart: () => void;
  tabletId: string;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, tabletId }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    onStart(); // 次の画面へ遷移
  };

  return (
    // クラス 'title-screen' でモダンな背景とレイアウトを適用
    <div className="screen title-screen">
      <header className="title-screen-header">
        <span className="tablet-id-text">タブレットID: {tabletId}</span>
      </header>

      <div className="title-center-content">
        <h1 className="main-title">🍽️ Tabletia</h1>
        <h2 className="sub-title">スマートテーブルオーダーシステム</h2>
      </div>

      <div className="start-button-area">
        <p className="start-prompt">タッチして注文を開始</p>
        <button
          className={`start-button ${isPressed ? "pressed" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          // onClickイベントはタッチイベントと重複するため削除または無効化
          onClick={(e) => e.preventDefault()}
        >
          <span className="start-button-icon">👆</span>
          <span className="start-button-text">START</span>
        </button>
      </div>
    </div>
  );
};

export default TitleScreen;
