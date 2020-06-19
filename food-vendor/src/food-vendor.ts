import { VendorMap } from './types';
import { Tracer } from '@opentelemetry/tracing';
import { ValueRecorder } from '@opentelemetry/api';
import { Meter } from '@opentelemetry/metrics';

interface Metrics {
  vendorRecorder: ValueRecorder;
  itemRecorder: ValueRecorder;
}

export default class FoodVendor {
  data: VendorMap;
  tracer: Tracer;
  metrics: Metrics;
  meter: Meter;

  constructor(data: VendorMap, tracer: Tracer, meter: Meter) {
    this.data = data;
    this.tracer = tracer;
    // Add metrics
    this.meter = meter;
    this.metrics = {
      vendorRecorder: this.meter.createValueRecorder('vendors', {
        description: 'a record of the vendors that are being queried for'
      }),
      itemRecorder: this.meter.createValueRecorder('items', {
        description: 'a record of the items that are being queried for'
      }),
    };
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
    this.metrics.vendorRecorder.record(Number(request.vendorId));
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
    this.metrics.itemRecorder.record(Number(request.itemId));
    this.randomDelay();
    span.addEvent('FoodVendor: found item', {item});
    span.end();
    callback(null, item);
  }

  private randomDelay() {
    for (let i = 0; i < Math.random() * 50000; i++) {}
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





