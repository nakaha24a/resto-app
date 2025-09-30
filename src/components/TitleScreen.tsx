// src/components/TitleScreen.tsx - すべてのインラインスタイルを排除し、CSSクラスを使用

import React, { useState } from "react";

interface TitleScreenProps {
  onStart: () => void;
  tabletId: string;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, tabletId }) => {
  const [isPressed, setIsPressed] = useState(false);

  // マウス/タッチダウン時の処理
  const handleMouseDown = () => {
    setIsPressed(true);
  };

  // マウス/タッチアップ時の処理（クリックイベントが発火するタイミング）
  const handleMouseUp = () => {
    setIsPressed(false);
    onStart();
  };

  return (
    // CSSクラス 'title-screen' が背景色 (#1e272e) とレイアウトを担当
    <div className="screen title-screen">
      <header className="title-screen-header">タブレットID: {tabletId}</header>

      {/* スタイルを直接指定せず、CSSクラスに依存 */}
      <div style={{ paddingBottom: "50px" }}>
        <h1>Tabletia</h1>
        <h2>スマートテーブルオーダーシステム</h2>
      </div>

      <div
        // CSSクラスでスタイルを適用し、isPressedでアクティブ状態を切り替え
        className={`start-button-area ${
          isPressed ? "start-button-active" : ""
        }`}
        onClick={handleMouseUp}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        role="button"
        aria-label="画面をタッチして注文開始"
      >
        画面をタッチして注文開始
      </div>

      <p className="title-message">
        タップ操作で追加注文や会計依頼が可能です。
      </p>
    </div>
  );
};

export default TitleScreen;
