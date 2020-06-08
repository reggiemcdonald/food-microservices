import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader';
import {join} from 'path';
import { Vendor } from './types';

export interface SupplierService {
  /**
   * Returns a list of vendors that carry the specified item
   * @param itemName string the item name that is being looked for now
   */
  findItem(itemName: string): Promise<Vendor[]>;
}

export default class DefaultSupplierService implements SupplierService {
  private supplierClient: any;
  
  constructor(url: string) {
    const definition: any = grpc.loadPackageDefinition(
      protoloader.loadSync(join(__dirname, '../../../proto/food.proto'), {keepCase: true})
    );
    this.supplierClient = new definition.FoodSupplier(url, grpc.credentials.createInsecure());
  }
  
  findItem(itemName: string): Promise<Vendor[]> {
    return new Promise((resolve, reject) => {
      this.supplierClient.findItem({itemName}, (err: any, res: any) => {
        if (err) {
          return reject(err);
        }
        const {vendors} = res;
        if (!vendors) {
          return  reject(`invalid data was returned from food supplier`);
        }
        const vendorsFound: Vendor[] = vendors.map((vendor: any) => {
          const {id, name} = vendor;
          return {id: vendor.id, name: vendor.name}
        });
        vendorsFound.filter(v => v.id && v.name);
        resolve(vendorsFound);
      });
    });
  }
}