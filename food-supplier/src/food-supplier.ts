const axios = require('axios').default;
import { Tracer } from '@opentelemetry/api';
import {Catalog, VendorMap, IdFinder} from './types';

export default class FoodSupplier {
  tracer: Tracer;
  catalog: Catalog;
  vendorMap: VendorMap;
  idFinder: IdFinder;

  constructor(tracer: Tracer, catalog: Catalog, vendors: VendorMap, idFinder?: IdFinder) {
    this.catalog = catalog;
    this.tracer = tracer;
    this.vendorMap = vendors;
    if (!idFinder) {
      this.idFinder = new DefaultIdFinder(tracer);
    } else {
      this.idFinder = idFinder;
    }
  }

  async findItem(call: any, callback: any): Promise<any> {
    const {request} = call;
    const {itemName} = request;
    const span = this.tracer.startSpan('FoodSupplier::findItem', {
      attributes: {
        itemName,
      },
      parent: this.tracer.getCurrentSpan(),
    });
    return this.tracer.withSpan(span, async () => {
      if (!itemName) {
        callback(new Error('missing itemName'), null);
        span.end();
        return;
      }
      let itemId: string;
      try {
        itemId = await this.idFinder.getItemIdFromSynonym(itemName);
      } catch (e) {
        callback(new Error(`${itemName} is not a recognized item name`), null);
        span.end();
        return;
      }
      const vendorIdsCarryingItem = this.catalog[itemId];
      if (!vendorIdsCarryingItem) {
        callback(new Error(`${itemName} is not carried by any vendors`), null);
        span.end();
        return;
      }
      const vendors = vendorIdsCarryingItem.map(vendorId => {
        return {id: vendorId, name: this.vendorMap[vendorId]};
      });
      callback(null, {itemId, vendors});
      span.end();
    });
  }
}

export const makeCatalog = (stocks: any[]): Catalog => {
  const catalog: Catalog = {};
  stocks.forEach(stock => {
    if (!catalog[stock.itemId]) {
      catalog[stock.itemId] = [];
    }
    catalog[stock.itemId].push(stock.vendorId);
  })
  return catalog;
};

export const makeVendors = (vendors: any[]): VendorMap => {
  const vendorMap: VendorMap = {};
  vendors.forEach(vendor => {
    vendorMap[vendor.id] = vendor.name;
  });
  return vendorMap;
};

export class DefaultIdFinder implements IdFinder {
  tracer: Tracer;

  constructor(tracer: Tracer) {
    this.tracer = tracer;
  }

  async getItemIdFromSynonym(synonym: string): Promise<string> {
    const itemLookupApiPort = process.env.ITEM_LOOKUP_API_PORT || '';
    const span = this.tracer.startSpan('DefaultIdFinder::getItemIdFromSynonym', {
      attributes: {
        synonym,
      },
      parent: this.tracer.getCurrentSpan(),
    });
    try {
      if (itemLookupApiPort === '') {
        throw new Error('missing or invalid port for item name lookup api');
      }
      const req = await axios.get(`http://food-item-lookup:${itemLookupApiPort}/api/nameLookup?name=${synonym}`);
      return req.data;
    } finally {
      span.end();
    }
  }
}

