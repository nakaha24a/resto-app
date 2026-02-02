import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
 
  publicDir: "public",
  plugins: [react()],
  define: {
    "process.env": {},
    "process.platform": '"browser"',
    "process.arch": '"x64"',
    "process.versions": "{}",
  },
  build: { ssr: false },
  server: {
    host: true,
    // 開発用プロキシ設定（CORS回避）
    proxy: {
      "/api": {
        target: "https://172.16.31.18", // バックエンドのURLに置き換え
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"), // パスはそのまま
      },
      "/assets": {
        target: "https://172.16.31.18",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
