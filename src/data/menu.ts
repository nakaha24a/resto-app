// src/data/menu.ts

import { MenuItem } from "../types";

export const MOCK_MENU: MenuItem[] = [
  {
    id: "M001",
    name: "マルゲリータ",
    price: 1280,
    description: "定番のイタリアンピザ",
    category: "ピザ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=PIZZA",
  },
  {
    id: "M002",
    name: "シーザーサラダ",
    price: 880,
    description: "新鮮野菜とベーコン",
    category: "サラダ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=SALAD",
  },
  {
    id: "M003",
    name: "カルボナーラ",
    price: 1450,
    description: "濃厚なチーズと卵黄",
    category: "パスタ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=PASTA",
  },
  {
    id: "M004",
    name: "アイスコーヒー",
    price: 350,
    description: "さっぱりとしたアイス",
    category: "ドリンク",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=COFFEE",
  },
  {
    id: "M005",
    name: "ティラミス",
    price: 550,
    description: "ほろ苦い大人のデザート",
    category: "デザート",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=DESSERT",
  },
  {
    id: "M006",
    name: "海老とアボカドのサラダ",
    price: 980,
    description: "女性に人気の組み合わせ",
    category: "サラダ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=SHRIMP",
  },
  {
    id: "M007",
    name: "ペペロンチーノ",
    price: 1100,
    description: "ニンニクと唐辛子のオイルベース",
    category: "パスタ",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=PEPERO",
  },
  {
    id: "M008",
    name: "オレンジジュース",
    price: 300,
    description: "果汁100%のフレッシュジュース",
    category: "ドリンク",
    imageUrl: "https://placehold.co/100x100/ecf0f1/34495e?text=OJ",
  },
];
