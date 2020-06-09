import { SupplierService } from "./supplier";
import { VendorService } from "./vendor";
import { ItemReport, Vendor, FindItemResponse, FoodItemAvailability } from "./types";

export default class FoodFinder {
  private supplierService: SupplierService;
  private vendorService: VendorService;

  constructor(supplierService: SupplierService, vendorService: VendorService) {
    this.supplierService = supplierService;
    this.vendorService = vendorService;
  }

  async findItemByName(itemName: string): Promise<ItemReport[]> {
    // Get a list of vendors that carry the item
    let findItemResponse: FindItemResponse;
    try {
      findItemResponse = await this.supplierService.findItem(itemName);
    } catch (e) {
      console.log(e);
      throw new Error('failed to lookup item with supplier');
    }
    const {itemId, vendors} = findItemResponse;
    // For each vendor, get the item availability
    let itemReport: ItemReport[] = [];
    try {
      const itmeAvailabilities: FoodItemAvailability[] = await Promise.all(
        vendors.map(vendor => {
          return this.vendorService.getItemAvailability(vendor.id, itemId);
        }));
      for (let i in vendors) {
        itemReport.push({vendor: vendors[i], itemAvailability: itmeAvailabilities[i]});
      }
      return itemReport;
    } catch (e) {
      throw new Error('encountered error while calling vendor service');
    }
  }
}