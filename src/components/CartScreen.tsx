import React from "react";
import { CartItem } from "../types";

interface CartScreenProps {
  cart: CartItem[];
  // App.tsxのhandleUpdateCart(menuItemId, newQuantity) に合わせて型を修正
  onUpdateCart: (menuItemId: string, quantity: number) => void;
  onGoToCheckout: () => void;
  onBackToOrder: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  onUpdateCart,
  onGoToCheckout,
  onBackToOrder,
}) => {
  const calculateTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleUpdateQuantity = (item: CartItem, change: number) => {
    const newQuantity = item.quantity + change;
    // App.tsxのonUpdateCart(menuItemId, newQuantity) を呼び出す
    onUpdateCart(item.menuItemId, newQuantity);
  };

  return (
    <div className="screen cart-screen flex flex-col p-6 h-full bg-gray-50">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
        カート内容の確認
      </h2>

      {cart.length === 0 ? (
        <p className="text-lg text-gray-500 italic flex-grow flex items-center justify-center">
          カートに商品が入っていません。
        </p>
      ) : (
        <ul className="space-y-4 overflow-y-auto flex-grow pr-2">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-3 bg-white shadow-md rounded-lg"
            >
              <div className="flex-grow">
                <p className="font-semibold text-lg text-gray-900">
                  {item.name}
                </p>
                <span className="text-sm text-gray-500">
                  ¥{item.price.toLocaleString()} / 個
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateQuantity(item, -1)}
                  disabled={item.quantity <= 1}
                  className="bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition disabled:opacity-50"
                >
                  -
                </button>
                <span className="font-bold text-xl w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(item, 1)}
                  className="bg-green-500 text-white w-8 h-8 rounded-full hover:bg-green-600 transition"
                >
                  +
                </button>
              </div>

              <span className="font-bold text-xl ml-4 w-24 text-right text-gray-700">
                ¥{(item.price * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 pt-4 border-t border-gray-300">
        <h3 className="text-2xl font-extrabold text-right text-gray-800">
          合計金額: ¥{calculateTotal.toLocaleString()}
        </h3>
      </div>

      <div className="flex justify-between mt-6 space-x-4">
        <button
          onClick={onBackToOrder}
          className="flex-1 py-3 bg-gray-300 text-gray-800 rounded-lg text-lg font-semibold hover:bg-gray-400 transition"
        >
          追加注文に戻る
        </button>
        <button
          onClick={onGoToCheckout}
          disabled={cart.length === 0}
          className="flex-1 py-3 bg-orange-600 text-white rounded-lg text-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
        >
          最終確認へ進む
        </button>
      </div>
    </div>
  );
};

export default CartScreen;
