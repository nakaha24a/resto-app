import React from "react";
import { Order } from "../types";

interface CompleteScreenProps {
  order: Order | null;
  status: string;
}

const CompleteScreen: React.FC<CompleteScreenProps> = ({ order, status }) => {
  if (!order) {
    return (
      <div className="screen complete-screen">
        <h2>注文がありません</h2>
        <p>前の画面に戻って注文を完了してください。</p>
      </div>
    );
  }

  return (
    <div className="screen complete-screen">
      <h2>ご注文完了</h2>
      <p>
        ご注文番号：<strong>#{order.id}</strong>
      </p>
      <h3>
        現在の状況: <span className="status">{status}</span>
      </h3>
      <p>この度はご利用いただきありがとうございます。担当者がお伺いします。</p>
    </div>
  );
};

export default CompleteScreen;
