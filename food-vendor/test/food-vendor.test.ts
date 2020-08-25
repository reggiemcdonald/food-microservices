import 'mocha';
import FoodVendor,{makeVendors} from '../src/food-vendor';
import * as assert from 'assert';
import { InventoryItem } from '../src/types';
import { newTestTracer } from '../src/trace';
import { newTestMeterProvider } from '../src/meter';

const vendorA = {id: '001', name: 'Food Vendor A'};
const vendorB = {id: '002', name: 'Food Vendor B'};
const itemA = {id: '100', name: 'Flour'};
const itemB = {id: '101', name: 'Sugar'};
const stockA = {vendorId: '001', itemId: '100', quantity: 5, price: 6.50};
const stockB = {vendorId: '001', itemId: '101', quantity: 4, price: 2.99};
const stockC = {vendorId: '002', itemId: '100', quantity: 3, price: 3.66};

describe('FoodVendor::getItemAvailability', () => {
  let foodVendor: FoodVendor;
  beforeEach(() => {
    const vendors = makeVendors([vendorA, vendorB], 
      [itemA, itemB], [stockA, stockB, stockC]
    );
    foodVendor = new FoodVendor(vendors, newTestTracer(), newTestMeterProvider());
  });
  it('should return an available item', () => {
    const expectedInventoryItem: InventoryItem = {
      id: '100',
      name: 'Flour',
      quantity: 5,
      price: 6.50
    };
    const request = {vendorId: '001', itemId: '100'};
    const callback = (err: any, res: any) => {
      if (err) {
        assert.fail(`Got an unexpected error: ${err.message}`);
      }
      assert.deepEqual(expectedInventoryItem, res);
    }
    foodVendor.getItemAvailability({request}, callback);
  });
  it('should return an error when the item isnt carried', () => {
    const request = {vendorId: '001', itemId: '103'};
    const callback = (err: any, res: any) => {
      if (!err) {
        assert.fail('expected to get an error');
      }
      assert.equal(true, err.message && err.message.includes(request.itemId));
    }
    foodVendor.getItemAvailability({request}, callback);
  })
});
