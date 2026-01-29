/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import type { MenuItem } from "../types";

interface OptionModalProps {
  menuItem: MenuItem;
  isOpen: boolean;
  onClose: () => void;
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
    new Set(),
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
        (opt: any) => (typeof opt === "string" ? opt : opt.name) === optName,
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

  const handleConfirm = () => {
    const optionsToPass = Array.from(selectedOptions).map((name) => {
      const originalOption = menuItem.options?.find(
        (opt: any) => (typeof opt === "string" ? opt : opt.name) === name,
      );
      return originalOption || name;
    });

    onConfirm(quantity, optionsToPass);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{`
        /* 横向きレイアウト（タブレット向け） */
        .modal-content {
           width: 90%;
           max-width: 800px; /* 幅を広げました */
           height: 80vh;
           max-height: 600px;
           background: white;
           border-radius: 15px;
           position: relative;
           overflow: hidden;
           display: flex; /* 横並びにする */
           flex-direction: row; 
           box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        /* 左側：画像エリア */
        .modal-left-pane {
           width: 50%;
           height: 100%;
           background: #000;
           display: flex;
           align-items: center;
           justify-content: center;
        }
        
        .modal-image {
           width: 100%;
           height: 100%;
           object-fit: cover; /* 枠いっぱいに表示 */
        }

        /* 右側：詳細・オプションエリア */
        .modal-right-pane {
           width: 50%;
           height: 100%;
           display: flex;
           flex-direction: column;
           padding: 20px;
           box-sizing: border-box;
        }

        .modal-header-text {
           margin-bottom: 10px;
           border-bottom: 1px solid #eee;
           padding-bottom: 10px;
        }
        .modal-header-text h2 { margin: 0 0 5px 0; font-size: 1.5rem; }
        .modal-header-text p { margin: 0; color: #666; font-size: 0.9rem; }

        /* オプションエリア（ここだけスクロール） */
        .modal-options {
           flex: 1;
           overflow-y: auto;
           margin-bottom: 15px;
           padding-right: 5px; /* スクロールバーとの被り防止 */
        }
        
        .option-item {
           display: flex;
           align-items: center;
           padding: 10px 0;
           border-bottom: 1px solid #f0f0f0;
        }
        .option-item input { transform: scale(1.3); margin-right: 10px; }
        .option-item label { font-size: 1rem; cursor: pointer; flex: 1; }

        /* フッターエリア */
        .modal-footer-area {
           margin-top: auto;
        }

        .modal-close-button {
           position: absolute;
           top: 15px;
           right: 15px; /* 右上のバツボタンは右パネル内に配置 */
           width: 36px;
           height: 36px;
           background: #eee;
           color: #333;
           border: none;
           border-radius: 50%;
           font-size: 1.5rem;
           cursor: pointer;
           z-index: 10;
           display: flex;
           align-items: center;
           justify-content: center;
        }

        /* モバイル対応（画面が狭い時だけ縦並びに戻す） */
        @media (max-width: 600px) {
           .modal-content { flex-direction: column; }
           .modal-left-pane { width: 100%; height: 200px; flex-shrink: 0; }
           .modal-right-pane { width: 100%; height: auto; flex: 1; }
        }
      `}</style>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 左側：画像 */}
        <div className="modal-left-pane">
          {menuItem.image ? (
            <img
              src={getImageUrl(menuItem.image)}
              alt={menuItem.name}
              className="modal-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x200?text=No+Image";
              }}
            />
          ) : (
            <div style={{ color: "white" }}>No Image</div>
          )}
        </div>

        {/* 右側：情報＆操作 */}
        <div className="modal-right-pane">
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>

          <div className="modal-header-text">
            <h2>{menuItem.name}</h2>
            <p>{menuItem.description}</p>
          </div>

          <div className="modal-options">
            {menuItem.options && menuItem.options.length > 0 ? (
              <>
                <h4 style={{ margin: "0 0 10px 0" }}>オプションを選択:</h4>
                {menuItem.options.map((option, idx) => {
                  const isObject =
                    typeof option === "object" && option !== null;
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
                      <label htmlFor={`option-${idx}`}>
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
              </>
            ) : (
              <p style={{ color: "#999", marginTop: "20px" }}>
                オプションはありません
              </p>
            )}
          </div>

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
                  width: "40px",
                  height: "40px",
                  fontSize: "1.2rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              >
                -
              </button>
              <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: "40px",
                  height: "40px",
                  fontSize: "1.2rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  background: "#fff",
                }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleConfirm}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "1.1rem",
                background: "#e67e22",
                color: "white",
                border: "none",
                borderRadius: "30px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              カートに追加 (¥{currentTotalPrice.toLocaleString()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionModal;
