import * as grpc from 'grpc';
import * as protoloader from '@grpc/proto-loader';
import {join} from 'path';
import { FoodItemAvailability } from "./types";
import { Tracer, Span } from '@opentelemetry/api';

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
  private tracer: Tracer;
  
  constructor(url: string, tracer: Tracer) {
    this.tracer = tracer;
    const definition: any = grpc.loadPackageDefinition(
      protoloader.loadSync(join(__dirname, '../../../proto/food.proto'), {keepCase: true})
    );
    this.vendorService = new definition.FoodVendor(url, grpc.credentials.createInsecure());
  }

  getItemAvailability(vendorId: string, itemId: string): Promise<FoodItemAvailability> {
    const span = this.tracer.startSpan('DefaultVendorService::getItemAvailability', {
      parent: this.tracer.getCurrentSpan(),
      attributes: {vendorId, itemId},
    });
    return new Promise((resolve, reject) => {
      this.vendorService.getItemAvailability({vendorId, itemId}, (err: any, res: any) => {
        if (err) {
          return this.onError(span, err, reject);
        }
        const {id, name, quantity, price} = res;
        if (!id || !name || !quantity || !price) {
          return this.onError(span, new Error('invalid data returned from vendor'), reject);
        }
        span.addEvent('DefaultVendorService: successsfully retrieved data from vendor');
        span.end();
        resolve({id, name, quantity, price});
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
    span.addEvent('DefaultVendorService: error encountered while calling vendor', {message: error.message});
    span.end();
    return reject(error);
  }
}
