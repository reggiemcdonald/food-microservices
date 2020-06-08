import { VendorMap } from './types';

export default class FoodVendor {
  data: VendorMap;
  constructor(data: VendorMap) {
    this.data = data;
  }
  getItemAvailability(call: any, callback: any): void {
    // TODO: Add random delays to slow the call down
    const {request} = call;
    const vendor = this.data && this.data[request.vendorId];
    if (!vendor) {
      callback(new Error('vendor does not exist'), null);
      return;
    }
    const item = vendor.inventory[request.itemId];
    if (item === undefined) {
      callback(new Error(`item ${request.itemId} is not available`), null);
      return;
    }
    callback(null, item);
  }
}

export const makeVendors = (vendors: any[], items: any[], stocks: any[]): VendorMap => {
  try {
    const vendorMap: VendorMap = {};
    const itemMap: any = {};
    vendors.forEach(vendor => {
      vendorMap[vendor.id] = {...vendor, inventory: {}};
    });
    items.forEach(item => {
      itemMap[item.id] = item;
    });
    stocks.forEach((stock: any) => {
      vendorMap[stock.vendorId].inventory[stock.itemId] = {
        ...itemMap[stock.itemId],
        quantity: stock.quantity,
        price: stock.price,
      };
    });
    return vendorMap;
  } catch (e) {
    return {};
  }
}





