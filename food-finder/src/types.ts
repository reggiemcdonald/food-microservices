export interface FoodItemAvailability {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Vendor {
  id: string;
  name: string;
}

export interface FindItemResponse {
  itemId: string;
  vendors: Vendor[];
}

export interface ItemReport {
  vendor: Vendor;
  itemAvailability: FoodItemAvailability;
}

