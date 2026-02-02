import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./components/styles/variables.css";  /* 変数は最初に読み込む */
import "./components/styles/layout.css";     /* 次にレイアウト */
import "./components/styles/components.css"; /* 最後に細かい部品 */
import { loadConfig } from "./config/runTimeConfig"; /* IPアドレスを読み込む */

// ルート作成
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

/**
 * ★ bootstrap 関数で config を読み込んでからアプリをレンダリング
 */
async function bootstrap() {
  try {
    await loadConfig(); // config.json をロード
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Failed to load runtime config:", err);
    root.render(
      <div style={{ padding: "40px", color: "red" }}>
        アプリの初期化に失敗しました。
      </div>
    );
  }
}

// 起動
bootstrap();
