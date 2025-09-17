import React, { useState } from "react";
import menuData from "../data/menuData.json";
import { Member, CartItem, MenuItem } from "../types";

interface OrderScreenProps {
  members: Member[];
  cart: CartItem[];
  onUpdateCart: (cart: CartItem[]) => void;
  onGoToCheckout: () => void;
}

const OrderScreen: React.FC<OrderScreenProps> = ({
  members,
  cart,
  onUpdateCart,
  onGoToCheckout,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて");

  const categories = [
    "すべて",
    ...new Set(menuData.map((item) => item.category)),
  ];

  const filteredMenu = menuData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "すべて" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (
    item: MenuItem,
    memberId: number,
    quantity: number = 1
  ) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id && cartItem.orderedBy === memberId
    );

    if (existingItemIndex !== -1) {
      const newCart = [...cart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        quantity: newCart[existingItemIndex].quantity + quantity,
      };
      onUpdateCart(newCart);
    } else {
      onUpdateCart([
        ...cart,
        { ...item, quantity: quantity, orderedBy: memberId },
      ]);
    }
  };

  const handleUpdateQuantity = (
    itemId: string,
    memberId: number,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      const newCart = cart.filter(
        (item) => !(item.id === itemId && item.orderedBy === memberId)
      );
      onUpdateCart(newCart);
    } else {
      const newCart = cart.map((item) =>
        item.id === itemId && item.orderedBy === memberId
          ? { ...item, quantity: newQuantity }
          : item
      );
      onUpdateCart(newCart);
    }
  };

  const handleRemoveFromCart = (itemId: string, memberId: number) => {
    const newCart = cart.filter(
      (item) => !(item.id === itemId && item.orderedBy === memberId)
    );
    onUpdateCart(newCart);
  };

  const getMemberName = (id: number): string => {
    const member = members.find((m) => m.id === id);
    return member?.name || `参加者${id}`;
  };

  return (
    <div className="order-layout">
      <div className="screen order-screen">
        <h2>メニュー</h2>
        <div className="menu-controls">
          <input
            type="text"
            placeholder="商品を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="menu-list">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item: MenuItem) => (
              <div key={item.id} className="menu-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p>¥{item.price}</p>
                  <div className="item-controls">
                    {members.length > 1 ? (
                      <select
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleAddToCart(item, Number(e.target.value))
                        }
                        defaultValue=""
                      >
                        <option value="" disabled>
                          注文者を選択
                        </option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item, members[0].id)}
                      >
                        カートに追加
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>該当する商品が見つかりません。</p>
          )}
        </div>
      </div>

      <div className="cart-sidebar">
        <h2>カート</h2>
        {cart.length === 0 ? (
          <p>カートは空です。</p>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((item) => (
                <li
                  key={`${item.id}-${item.orderedBy}`}
                  className="cart-sidebar-item"
                >
                  <div className="cart-sidebar-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-details">
                      {getMemberName(item.orderedBy)} / ¥{item.price}
                    </span>
                  </div>
                  <div className="cart-sidebar-item-controls">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id,
                          item.orderedBy,
                          item.quantity - 1
                        )
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id,
                          item.orderedBy,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        handleRemoveFromCart(item.id, item.orderedBy)
                      }
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="total">
              <strong>
                合計: ¥
                {cart.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )}
              </strong>
            </div>
            <button className="goto-checkout-btn" onClick={onGoToCheckout}>
              会計に進む
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderScreen;
