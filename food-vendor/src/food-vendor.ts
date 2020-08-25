import { VendorMap } from './types';
import { Tracer } from '@opentelemetry/tracing';
import { ValueRecorder, Counter } from '@opentelemetry/api';
import { Meter } from '@opentelemetry/metrics';

interface Metrics {
  invalidVendorErrorCount: Counter;
  invalidItemErrorCount: Counter;
  otherErrorCount: Counter;
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
      invalidVendorErrorCount: this.meter.createCounter('invalid-vendors', {
        description: 'a count of the number of times an ' +
          'invalid vendor ID is used to query the system',
      }),
      invalidItemErrorCount: this.meter.createCounter('invalid-items', {
        description: 'a count of the number of times an ' +
          'invalid item ID is used to query the system',
      }),
      otherErrorCount: this.meter.createCounter('misc-errors', {
        description: 'a count of random errors'
      }),
    };
  }

  getItemAvailability(call: any, callback: any): void {
    const {request} = call;
    if (!request.vendorId || !request.itemId) {
      this.metrics.otherErrorCount.add(1);
      callback(new Error('missing itemId or vendorId in request'), null);
      return;
    }
    const vendor = this.data && this.data[request.vendorId];
    const span = this.tracer.startSpan('FoodVendor::getItemAvailability', {
      parent: this.tracer.getCurrentSpan(),
      attributes: {
        vendor,  
      }
    });
    if (!vendor) {
      const error = new Error('vendor does not exist');
      callback(error, null);
      this.metrics.invalidVendorErrorCount.add(1);
      span.addEvent('error: FoodVendor', {
        message: error.message,
      });
      span.end();
      return;
    }
    const item = vendor.inventory[request.itemId];
    if (item === undefined) {
      const error = new Error(`item ${request.itemId} is not available`);
      callback(error, null);
      this.metrics.invalidItemErrorCount.add(1);
      span.addEvent('error: FoodVendor', {
        message: error.message,
      });
      span.end();
      return;
    }
    this.randomDelay();
    span.addEvent('FoodVendor: found item', {item});
    span.end();
    callback(null, item);
  }

  private randomDelay() {
    for (let i = 0; i < Math.random() * 5000000; i++) {}
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





