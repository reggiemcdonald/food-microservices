import 'mocha';
import * as assert from 'assert';
import FoodSupplier, {makeCatalog, makeVendors} from '../src/food-supplier';
import {Catalog, IdFinder, VendorMap} from '../src/types';
import { Tracer } from '@opentelemetry/api';
import { newTestTracer } from '../src/trace';

const catalog: Catalog = {
  '100': [
    '001',
    '002'
  ],
  '101': [
    '003'
  ],
  '102': [
    '001',
    '003'
  ],
};

const vendors: VendorMap = {
  '001': 'Food Vendor A',
  '002': 'Food Vendor B',
  '003': 'Food Vendor C',
};

const mockIdFinder: IdFinder = {
  getItemIdFromSynonym: async (synonym: string): Promise<string> => {
    synonym = synonym.toLowerCase();
    switch (synonym) {
      case 'flour':
      case 'bakers flour':
        return '100';
      case 'white sugar':
      case 'sugar':
        return '101';
      case 'butter':
      case 'unsalted butter':
        return '102';
      default:
        throw new Error('unknown type');
    }
  }
}


describe('FoodSupplier::findItem', () => {
  let foodSupplier: FoodSupplier;
  beforeEach(() => {
    foodSupplier = new FoodSupplier(newTestTracer(), catalog, vendors, mockIdFinder);
  });
  it('should return a list of vendor IDs', () => {
    const request = {itemName: 'Flour'};
    const callback = (err: any, res: any) => {
      if (err) {
        assert.fail(`encountered unexpected error ${err}`);
        return;
      }
      const expected = {
        itemId: '100',
        vendors: [
          {id: '001', name: 'Food Vendor A'},
          {id: '002', name: 'Food Vendor B'},
        ]
      }
      assert.deepEqual(expected, res);
    };
    foodSupplier.findItem({request}, callback);
  });
  it('should return an error with a non-existant food item', () => {
    const request = {itemName: 'Squash'};
    const callback = (err: any, res: any) => {
      if (!err) {
        assert.fail('expected error but was null');
      }
      assert.equal(true, err.message.includes('Squash'));
    };
    foodSupplier.findItem({request}, callback);
  });
});
describe('makeCatalog', () => {
  it('should create a mapping between item ID and vendor IDs', () => {
    const stocks = [
      {vendorId: '001', itemId: '100'},
      {vendorId: '001', itemId: '101'},
      {vendorId: '002', itemId: '100'},
    ];
    const expected = {
      '100': ['001', '002'],
      '101': ['001'],
    };
    assert.deepEqual(expected, makeCatalog(stocks));
  });
});
describe('makeVendors', () => {
  it ('should create a mapping between vendor id and vendor name', () => {
    const vendorsReadFromFile = [
      {id: '001', name: 'Food Vendor A'},
      {id: '002', name: 'Food Vendor B'},
      {id: '003', name: 'Food Vendor C'},
    ];
    assert.deepEqual(vendors, makeVendors(vendorsReadFromFile));
  });
});

