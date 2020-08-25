import 'mocha';
import * as assert from 'assert';
import { SupplierService } from '../src/supplier';
import { FindItemResponse, FoodItemAvailability, Vendor, ItemReport } from '../src/types';
import { VendorService } from '../src/vendor';
import FoodFinder from '../src/food-finder';
import { newTestTracer } from '../src/trace';

const foodVendorA: Vendor = {
  id: '001',
  name: 'Food Vendor A',
};

const foodVendorB: Vendor = {
  id: '002',
  name: 'Food Vendor B',
};

const flourAvailabilityVendorA: FoodItemAvailability = {
  id: '100',
  name: 'Flour',
  quantity: 7,
  price: 4.99,
};

const flourAvailabilityVendorB: FoodItemAvailability = {
  id: '100',
  name: 'Flour',
  quantity: 6,
  price: 5.99,
};

const mockSupplier: SupplierService = {
  findItem: (itemName: string): Promise<FindItemResponse> => {
    if (itemName === 'flour') {
      return Promise.resolve({
        itemId: '100',
        vendors: [foodVendorA, foodVendorB],
      });
    } else {
      return Promise.reject(new Error('not found'));
    }
  }
}

const mockVendor: VendorService = {
  getItemAvailability: (vendorId: string, itemId: string): Promise<FoodItemAvailability> => {
    if (vendorId !== foodVendorA.id && vendorId !== foodVendorB.id) {
      return Promise.reject(new Error('unrecognized vendor'));
    }
    if (itemId !== '100') {
      return Promise.reject(new Error('item is not carried'));
    }
    if (vendorId === foodVendorA.id) {
      return Promise.resolve(flourAvailabilityVendorA);
    } else {
      return Promise.resolve(flourAvailabilityVendorB);
    }
  }
}

describe('FoodFinder::findItemByName', () => {
  let foodFinder: FoodFinder;
  
  beforeEach(() => {
    foodFinder = 
      new FoodFinder(mockSupplier, mockVendor, newTestTracer());
  });

  it('should successfully find item availability for an available item', async () => {
    const expeceted: ItemReport[] = [
      {vendor: foodVendorA, itemAvailability: flourAvailabilityVendorA},
      {vendor: foodVendorB, itemAvailability: flourAvailabilityVendorB},
    ];
    try {
      assert.deepEqual(expeceted, await foodFinder.findItemByName('flour'));
    } catch (e) {
      assert.fail(`received unexpected error ${e.message}`);
    }
  });

  it('should return an error if no item can be found by the name', async () => {
    let result;
    try {
      result = await foodFinder.findItemByName('sugar');
    } catch (e) {
      result = e;
    }
    assert.equal(true, result instanceof Error)
  });
});
