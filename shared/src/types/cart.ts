export interface CartItemOptions {
  sizeType?: string;
  trussType?: 'Curved' | 'Straight';
  numberOfBays?: number;
  catSlide?: boolean;
  legType?: string;
  oakType: 'Reclaimed' | 'Kilned Dried' | 'Green';
  dimensions?: {
    length: number;
    width: number;
    thickness?: number;
  };
}

export interface CartItem {
  productConfigId: string;
  quantity: number;
  options: CartItemOptions;
  priceAtTime: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartTotals {
  subtotal: number;
  itemCount: number;
  items: CartItem[];
} 