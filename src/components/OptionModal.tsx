import React, { useState, useEffect, useMemo } from "react";
import { MenuItem } from "../types";

interface OptionModalProps {
  menuItem: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  // 修正: どんな型でも受け取れるように any[] に変更
  onConfirm: (quantity: number, selectedOptions: any[]) => void;
}

const OptionModal: React.FC<OptionModalProps> = ({
  menuItem,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:443";

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    let cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    if (!cleanPath.startsWith("assets/") && !cleanPath.startsWith("static/")) {
      cleanPath = `assets/${cleanPath}`;
    }
    return `${API_BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedOptions(new Set());
    }
  }, [isOpen]);

  const currentTotalPrice = useMemo(() => {
    const optionsTotal = Array.from(selectedOptions).reduce((sum, optName) => {
      const foundOption = menuItem.options?.find(
        (opt: any) => (typeof opt === "string" ? opt : opt.name) === optName
      );
      if (
        typeof foundOption === "object" &&
        foundOption !== null &&
        "price" in foundOption
      ) {
        return sum + (Number(foundOption.price) || 0);
      }
      return sum;
    }, 0);
    return (menuItem.price + optionsTotal) * quantity;
  }, [menuItem, selectedOptions, quantity]);

  if (!isOpen) return null;

  const handleOptionChange = (optionName: string) => {
    const newOptions = new Set(selectedOptions);
    if (newOptions.has(optionName)) {
      newOptions.delete(optionName);
    } else {
      newOptions.add(optionName);
    }
    setSelectedOptions(newOptions);
  };

  // ★重要修正: オプション情報を完全な形で渡す
  const handleConfirm = () => {
    const optionsToPass = Array.from(selectedOptions).map((name) => {
      const originalOption = menuItem.options?.find(
        (opt: any) => (typeof opt === "string" ? opt : opt.name) === name
      );
      // 文字列ではなく、元のオブジェクト（価格含む）を返す
      return originalOption || name;
    });

    onConfirm(quantity, optionsToPass);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{`
        /* ★ Aiwa Tab 10x 用のCSS修正 */
        .modal-content {
            width: 90%;
            max-width: 500px;
            /* 画面の高さの90%まで広げる */
            height: 90vh;
            max-height: 800px;
            
            /* 中身をフレックスボックスにして配置を整理 */
            display: flex;
            flex-direction: column;
            
            background: white;
            padding: 20px;
            border-radius: 15px;
            position: relative;
            overflow: hidden; /* 全体のスクロールは禁止 */
        }
        
        .modal-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 10px;
            flex-shrink: 0; /* 画像は縮めない */
        }

        .modal-header-area {
            flex-shrink: 0;
            margin-bottom: 10px;
        }

        /* オプションエリアを可変長にする */
        .modal-options {
            flex: 1;             /* 余ったスペースを全部使う */
            overflow-y: auto;    /* ここだけスクロールさせる */
            margin: 10px 0;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #eee;
        }
        
        .option-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #eee;
            font-size: 1.1rem;
        }
        .option-item input {
            transform: scale(1.5);
            margin-right: 15px;
        }

        .modal-footer-area {
            flex-shrink: 0; /* フッターは縮めない */
            border-top: 1px solid #eee;
            padding-top: 15px;
        }

        .modal-close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 10;
        }
      `}</style>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>

        {/* ヘッダーエリア（画像・タイトル） */}
        <div className="modal-header-area">
          {menuItem.image && (
            <img
              src={getImageUrl(menuItem.image)}
              alt={menuItem.name}
              className="modal-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x200?text=No+Image";
              }}
            />
          )}
          <h2 style={{ margin: "10px 0" }}>{menuItem.name}</h2>
          <p style={{ color: "#666" }}>{menuItem.description}</p>
        </div>

        {/* スクロール可能なオプションエリア */}
        {menuItem.options && menuItem.options.length > 0 ? (
          <div className="modal-options">
            <h4 style={{ marginBottom: "10px" }}>オプションを選択:</h4>
            {menuItem.options.map((option, idx) => {
              const isObject = typeof option === "object" && option !== null;
              // @ts-ignore
              const optionName = isObject ? option.name : option;
              // @ts-ignore
              const optionPrice = isObject ? option.price : 0;

              return (
                <div key={idx} className="option-item">
                  <input
                    type="checkbox"
                    id={`option-${idx}`}
                    checked={selectedOptions.has(optionName)}
                    onChange={() => handleOptionChange(optionName)}
                  />
                  <label htmlFor={`option-${idx}`} style={{ width: "100%" }}>
                    {optionName}
                    {optionPrice > 0 && (
                      <span
                        style={{
                          color: "#e67e22",
                          fontWeight: "bold",
                          marginLeft: "10px",
                        }}
                      >
                        (+¥{optionPrice})
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        ) : (
          // オプションがない場合のスペース埋め
          <div style={{ flex: 1 }}></div>
        )}

        {/* フッターエリア（数量・追加ボタン） */}
        <div className="modal-footer-area">
          <div
            className="modal-quantity"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              marginBottom: "15px",
            }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              style={{
                width: "50px",
                height: "50px",
                fontSize: "1.5rem",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            >
              -
            </button>
            <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                width: "50px",
                height: "50px",
                fontSize: "1.5rem",
                borderRadius: "10px",
                border: "1px solid #ccc",
                background: "#fff",
              }}
            >
              +
            </button>
          </div>

          <button
            className="add-to-cart-button"
            onClick={handleConfirm}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "1.2rem",
              background: "#e67e22",
              color: "white",
              border: "none",
              borderRadius: "30px",
              fontWeight: "bold",
            }}
          >
            カートに追加 (¥{currentTotalPrice.toLocaleString()})
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionModal;
