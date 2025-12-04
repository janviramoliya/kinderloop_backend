export interface ProductModel {
  name: string;
  description: string;
  originalPrice: number;
  currentPrice: number;
  category: string;
  ageGroup?: string;
  condition: string;
  sellType: 'Sell with us' | 'Sell to us';
  images: any;
  pickupAddress: string;
  itemUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
