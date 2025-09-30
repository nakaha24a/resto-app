import React from "react";
import { CartItem } from "../types"; // Order 型はApp.tsxでのみ使用するため削除

interface CheckoutScreenProps {
  orderItems: CartItem[];
  // App.tsxのhandleOrderConfirmに合わせて引数なしに戻します
  onPlaceOrder: () => void;
  onBackToOrder: () => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  orderItems,
  onPlaceOrder,
  onBackToOrder,
}) => {
  const calculateTotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrderClick = () => {
    // App.tsxのhandleOrderConfirmを呼び出し、注文を確定する
    // 注文オブジェクトの作成はApp.tsx側で行います
    onPlaceOrder();
  };

  return (
    <div className="screen checkout-screen p-8 h-full bg-gray-100 flex flex-col justify-between">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800">
        最終注文確認
      </h2>

      <div className="order-details-box bg-white p-6 shadow-2xl rounded-xl flex-grow overflow-hidden">
        <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-indigo-700">
          ご注文内容 ($\times$
          <span className="font-mono text-xl">{orderItems.length}</span> 品)
        </h3>
        <ul className="final-order-list space-y-3 overflow-y-auto max-h-96">
          {orderItems.map((item) => (
            <li key={item.id} className="flex justify-between text-lg">
              <span className="font-medium text-gray-700 w-3/5">
                {item.name}
              </span>
              <span className="text-gray-500 w-1/5 text-center">
                x {item.quantity}
              </span>
              <span className="font-bold text-right w-1/5 text-gray-800">
                ¥{(item.price * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-4 border-t-4 border-dashed border-gray-300">
          <div className="flex justify-between items-baseline">
            <h1 className="text-3xl font-extrabold text-indigo-800">
              合計金額:
            </h1>
            <h1 className="text-5xl font-extrabold text-red-600">
              ¥{calculateTotal.toLocaleString()}
            </h1>
          </div>
        </div>
      </div>

      <div className="checkout-controls mt-8 space-y-4">
        <p className="confirm-message text-center text-xl font-medium text-gray-700">
          この内容でよろしければ、「注文を完了する」ボタンを押してください。
        </p>
        <p className="note text-center text-sm text-gray-500">
          代金は後ほどお席でスタッフにお支払いください。
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onBackToOrder}
            className="flex-1 py-4 bg-gray-400 text-white rounded-xl text-xl font-bold hover:bg-gray-500 transition shadow-lg"
          >
            注文内容を修正する
          </button>
          <button
            onClick={handlePlaceOrderClick}
            className="flex-1 py-4 bg-red-600 text-white rounded-xl text-xl font-bold hover:bg-red-700 transition shadow-lg"
            disabled={orderItems.length === 0}
          >
            注文を完了する
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
