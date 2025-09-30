// src/components/ThanksScreen.tsx

import React from "react";

interface ThanksScreenProps {
  // App.tsxで使用されているプロパティを定義します
  onBackToTitle: () => void;
}

const ThanksScreen: React.FC<ThanksScreenProps> = ({ onBackToTitle }) => {
  return (
    <div className="screen thanks-screen flex flex-col items-center justify-center p-8 text-center bg-white h-full">
      <div className="p-10 rounded-xl shadow-2xl bg-teal-50">
        <h1 className="text-6xl font-extrabold text-teal-600 mb-6">
          ありがとうございました！
        </h1>
        <p className="text-2xl text-gray-700 mb-8">
          またのご利用をお待ちしております。
        </p>
        <button
          onClick={onBackToTitle}
          className="py-4 px-10 bg-red-500 text-white rounded-xl text-xl font-bold hover:bg-red-600 transition shadow-lg"
        >
          最初の画面に戻る
        </button>
      </div>
    </div>
  );
};

export default ThanksScreen;
