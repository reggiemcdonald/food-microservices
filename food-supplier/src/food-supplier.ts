const axios = require('axios').default;
import {Catalog, VendorMap, IdFinder} from './types';

export default class FoodSupplier {
  catalog: Catalog;
  vendorMap: VendorMap;
  idFinder: IdFinder;

  constructor(catalog: Catalog, vendors: VendorMap, idFinder: IdFinder = new DefaultIdFinder()) {
    this.catalog = catalog;
    this.vendorMap = vendors;
    this.idFinder = idFinder;
  }
  async findItem(call: any, callback: any): Promise<any> {
    const {request} = call;
    const {itemName} = request;
    if (!itemName) {
      callback(new Error('missing itemName'), null);
      return;
    }
    let itemId: string;
    try {
      itemId = await this.idFinder.getItemIdFromSynonym(itemName);
    } catch (e) {
      callback(new Error(`${itemName} is not a recognized item name`), null);
      return;
    }
    const vendorIdsCarryingItem = this.catalog[itemId];
    if (!vendorIdsCarryingItem) {
      callback(new Error(`${itemName} is not carried by any vendors`), null);
      return;
    }
    const vendors = vendorIdsCarryingItem.map(vendorId => {
      return {id: vendorId, name: this.vendorMap[vendorId]};
    });
    callback(null, {itemId, vendors});
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
  async getItemIdFromSynonym(synonym: string): Promise<string> {
    const itemLookupApiPort = process.env.ITEM_LOOKUP_API_PORT || '';
    if (itemLookupApiPort === '') {
      throw new Error('missing or invalid port for item name lookup api');
    }
    const req = await axios.get(`http://localhost:${itemLookupApiPort}/api/nameLookup?name=${synonym}`);
    return req.data;
  }
}

