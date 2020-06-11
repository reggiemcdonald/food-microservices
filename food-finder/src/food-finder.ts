import { Tracer, SpanKind } from '@opentelemetry/api';
import { SupplierService } from "./supplier";
import { VendorService } from "./vendor";
import { ItemReport, Vendor, FindItemResponse, FoodItemAvailability } from "./types";

export default class FoodFinder {
  private supplierService: SupplierService;
  private vendorService: VendorService;
  tracer: Tracer

  constructor(supplierService: SupplierService, vendorService: VendorService, tracer: Tracer) {
    this.supplierService = supplierService;
    this.vendorService = vendorService;
    this.tracer = tracer;
  }

  async findItemByName(itemName: string): Promise<ItemReport[]> {
    // Get a list of vendors that carry the item
    const span = this.tracer.startSpan('FoodFinder::findItemByName', {
      parent: this.tracer.getCurrentSpan(),
    });
    return this.tracer.withSpan(span, async () => {
      let findItemResponse: FindItemResponse;
      try {
        span.addEvent('calling supplier service');
        findItemResponse = await this.supplierService.findItem(itemName);
      } catch (e) {
        span.addEvent('error calling supplier service', {message: e.message});
        span.end();
        throw new Error(`Supplier did not find ${itemName}`);
      }
      const {itemId, vendors} = findItemResponse;
      // For each vendor, get the item availability
      let itemReport: ItemReport[] = [];
      try {
        span.addEvent('getting item availability');
        const itmeAvailabilities: FoodItemAvailability[] = await Promise.all(
          vendors.map(vendor => {
            return this.vendorService.getItemAvailability(vendor.id, itemId);
          }));
        span.addEvent('successfully queried for item availability');
        for (let i in vendors) {
          itemReport.push({vendor: vendors[i], itemAvailability: itmeAvailabilities[i]});
        }
        return itemReport;
      } catch (e) {
        span.addEvent('error getting item availability', {message: e.message});
        throw new Error('encountered error while calling vendor service');
      } finally {
        span.end();
      }
    });
  }
}

