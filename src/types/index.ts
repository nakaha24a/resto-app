export interface Member {
  id: number;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  allergens: string[];
  toppings?: string[];
  spiceLevels?: string[];
}

export interface CartItem extends MenuItem {
  orderedBy: number;
  quantity: number;
}

export interface Order {
  id: number;
  members: Member[];
  items: CartItem[];
  total: number;
  timestamp: string;
}
