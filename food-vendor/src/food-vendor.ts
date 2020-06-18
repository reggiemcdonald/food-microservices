import { VendorMap } from './types';
import { Tracer } from '@opentelemetry/tracing';

export default class FoodVendor {
  data: VendorMap;
  tracer: Tracer;

  constructor(data: VendorMap, tracer: Tracer) {
    this.data = data;
    this.tracer = tracer;
  }

  getItemAvailability(call: any, callback: any): void {
    const {request} = call;
    const vendor = this.data && this.data[request.vendorId];
    const span = this.tracer.startSpan('FoodVendor::getItemAvailability', {
      parent: this.tracer.getCurrentSpan(),
      attributes: {
        vendor,  
      }
    });
    if (!vendor) {
      callback(new Error('vendor does not exist'), null);
      span.addEvent('error: FoodVendor', {
        message: 'vendor does not exist',
      });
      span.end();
      return;
    }
    const item = vendor.inventory[request.itemId];
    if (item === undefined) {
      const error = new Error(`item ${request.itemId} is not available`);
      callback(error, null);
      span.addEvent('error: FoodVendor', {
        message: error.message,
      });
      span.end();
      return;
    }
    span.addEvent('FoodVendor: found item', {item});
    span.end();
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





