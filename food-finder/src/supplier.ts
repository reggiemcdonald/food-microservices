import * as grpc from 'grpc';
import * as protoloader from '@grpc/proto-loader';
import { Tracer, Span } from '@opentelemetry/api';
import {join} from 'path';
import { Vendor, FindItemResponse } from './types';

export interface SupplierService {
  /**
   * Returns a list of vendors that carry the specified item
   * @param itemName string the item name that is being looked for now
   */
  findItem(itemName: string): Promise<FindItemResponse>;
}

export default class DefaultSupplierService implements SupplierService {
  private supplierClient: any;
  private tracer: Tracer;
  
  constructor(url: string, tracer: Tracer) {
    this.tracer = tracer;
    const definition: any = grpc.loadPackageDefinition(
      protoloader.loadSync(join(__dirname, '../../../proto/food.proto'), {keepCase: true})
    );
    this.supplierClient = new definition.FoodSupplier(url, grpc.credentials.createInsecure());
  }
  
  findItem(itemName: string): Promise<FindItemResponse> {
    const span = this.tracer.startSpan('DefaultSupplierService::findItem', {
      parent: this.tracer.getCurrentSpan(),
    });
    return new Promise((resolve, reject) => {
      this.supplierClient.findItem({itemName}, (err: any, res: any) => {
        if (err) {
          return this.onError(span, err, reject)
        }
        const {itemId, vendors} = res;
        if (!vendors || !itemId) {
          return this.onError(span, new Error('invalid data returned from supplier'), reject);
        }
        const vendorsFound: Vendor[] = vendors.map((vendor: any) => {
          return {id: vendor.id, name: vendor.name}
        });
        vendorsFound.filter(v => v.id && v.name);
        span.addEvent('DefaultSupplierService: successfully retrieved data from supplier');
        span.end();
        resolve({itemId, vendors: vendorsFound});
      });
    });
  }

  /**
   * A helper function for handling errors, to ensure that the span is properly ended
   * @param span the span for the current context
   * @param error the error that is being handledd
   * @param reject promise reject function
   */
  private onError(span: Span, error: Error, reject: (reason?: any) => void): void {
    span.addEvent('DefualtSupplierService error', {message: error.message});
    span.end();
    return reject(error);
  }
}
