import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader';
import {join} from 'path';
import { FoodItemAvailability } from "./types";

export interface VendorService {
  /**
   * Return the item availability for the given vendor and item
   * @param vendorId string id of vendor
   * @param itemId string id of item
   */
  getItemAvailability(vendorId: string, itemId: string): Promise<FoodItemAvailability>;
}

export default class DefaultVendorService implements VendorService {
  private vendorService: any;
  
  constructor(url: string) {
    const definition: any = grpc.loadPackageDefinition(
      protoloader.loadSync(join(__dirname, '../../../proto/food.proto'), {keepCase: true})
    );
    this.vendorService = new definition.FoodVendor(url, grpc.credentials.createInsecure());
  }

  getItemAvailability(vendorId: string, itemId: string): Promise<FoodItemAvailability> {
    return new Promise((resolve, reject) => {
      this.vendorService.getItemAvailability({vendorId, itemId}, (err: any, res: any) => {
        if (err) {
          return reject(err);
        }
        const {id, name, quantity, price} = res;
        if (!id || !name || !quantity || !price) {
          return reject(new Error('invalid data receieved from vendor service'));
        }
        resolve({id, name, quantity, price});
      });
    });
  }
}
