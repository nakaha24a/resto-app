import React from "react";

interface TitleScreenProps {
  onStart: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="screen title-screen">
      <h1>スマート注文システム</h1>
      <p>スムーズな注文と会計を体験しよう</p>
      <button className="cta-button" onClick={onStart}>
        注文を始める
      </button>
    </div>
  );
};

export default TitleScreen;
