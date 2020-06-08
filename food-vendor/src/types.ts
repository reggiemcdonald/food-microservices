/**
 * An inventory item, with ID,
 * the name of the item, and the quantity in stock
 */
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export type InventoryMap = {[key: string]: InventoryItem};

/**
 * A vendor contains an ID, name,
 * and a mapping of item ID to InventoryItem
 */
export interface Vendor {
  id: string;
  name: string;
  inventory: InventoryMap;
}

export type VendorMap = {[key: string]: Vendor}

export interface FoodVendorServer {
  data: VendorMap;
  getItemAvailability: void;
}