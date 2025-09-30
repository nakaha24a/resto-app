// src/components/CompleteScreen.tsx (修正)

import React from "react";
import { Order } from "../types";

interface CompleteScreenProps {
  order: Order | null;
  status: string; // "ORDER" | "PAYMENT"
  onGoBack: () => void;
}

const CompleteScreen: React.FC<CompleteScreenProps> = ({
  order,
  status,
  onGoBack,
}) => {
  // 注文がない場合のエラーハンドリング
  if (!order) {
    return (
      <div className="screen complete-screen error-state">
        <h2 className="title-text">❌ エラー</h2>
        <p className="message-text">注文情報が見つかりません。</p>
        <button onClick={onGoBack} className="main-action-button back-to-menu">
          メニューに戻る
        </button>
      </div>
    );
  }

  // ステータスに応じたメッセージの切り替え
  const title = status === "ORDER" ? "✅ ご注文完了" : "✅ 会計依頼完了";
  const message =
    status === "ORDER"
      ? `ご注文ありがとうございます。\nご注文内容を準備中です。`
      : `会計依頼を承りました。\nスタッフがお席（${order.tableNumber}）へお伺いします。しばらくお待ちください。`;

  // 注文合計金額の計算 (シンプル化のため表示はしませんが、関数は残します)
  const calculateTotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    // CSSクラス 'complete-screen' で中央寄せと全体スタイルを適用
    <div className="screen complete-screen">
      <div className="complete-content-box">
        <h2 className="title-text">{title}</h2>
        <p className="order-id-display">
          受付番号: <strong>#{order.id}</strong>
        </p>
        <p className="message-text whitespace-pre-wrap">{message}</p>

        {/*
          お客様の要望に基づき、シンプルに「メニューに戻る」ボタンのみ
          注文概要の表示は削除
        */}
        <button onClick={onGoBack} className="main-action-button back-to-menu">
          メニューに戻る
        </button>
      </div>
    </div>
  );
};

export default CompleteScreen;
