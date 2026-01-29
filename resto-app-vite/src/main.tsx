import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./components/styles/variables.css"; /* 変数は最初に読み込む */
import "./components/styles/layout.css"; /* 次にレイアウト */
import "./components/styles/components.css"; /* 最後に細かい部品 */

//import "./components/styles.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
