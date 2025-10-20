// src/data/menu.ts

import { MenuItem } from "../types";

import M001Image from "../assets/maruge.jpeg";
import M002Image from "../assets/siza.jpg";
import M003Image from "../assets/karubo.jpg";
import M004Image from "../assets/maruge.jpeg";
import M005Image from "../assets/siza.jpg";
import M006Image from "../assets/karubo.jpg";
import M007Image from "../assets/pepe.jpeg";
import M008Image from "../assets/orenjijyusu.jpeg";

export const MOCK_MENU: MenuItem[] = [
  {
    id: "M001",
    name: "マルゲリータ",
    price: 1280,
    description: "定番のイタリアンピザ",
    category: "ピザ",
    imageUrl: M001Image,
    isRecommended: true,
  },
  {
    id: "M002",
    name: "シーザーサラダ",
    price: 880,
    description: "新鮮野菜とベーコン",
    category: "サラダ",
    imageUrl: M002Image,
  },
  {
    id: "M003",
    name: "カルボナーラ",
    price: 1450,
    description: "濃厚なチーズと卵黄",
    category: "パスタ",
    imageUrl: M003Image,
    isRecommended: true,
  },
  {
    id: "M004",
    name: "アイスコーヒー",
    price: 350,
    description: "さっぱりとしたアイス",
    category: "ドリンク",
    imageUrl: M004Image,
  },
  {
    id: "M005",
    name: "ティラミス",
    price: 550,
    description: "ほろ苦い大人のデザート",
    category: "デザート",
    imageUrl: M005Image,
  },
  {
    id: "M006",
    name: "海老とアボカドのサラダ",
    price: 980,
    description: "女性に人気の組み合わせ",
    category: "サラダ",
    imageUrl: M006Image,
    isRecommended: true,
  },
  {
    id: "M007",
    name: "ペペロンチーノ",
    price: 1100,
    description: "ニンニクと唐辛子のオイルベース",
    category: "パスタ",
    imageUrl: M007Image,
  },
  {
    id: "M008",
    name: "オレンジジュース",
    price: 300,
    description: "果汁100%のフレッシュジュース",
    category: "ドリンク",
    imageUrl: M008Image,
  },
];
