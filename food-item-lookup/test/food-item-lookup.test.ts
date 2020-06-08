import 'mocha';
import * as assert from 'assert';
import FoodItemLookup, { buildDictionary } from '../src/food-item-lookup';
import {Dictionary} from '../src/types';

describe('FoodItemLookup::findItem', () => {
  let foodItemLookup: FoodItemLookup;
  beforeEach(() => {
    foodItemLookup = new FoodItemLookup({
      'flour': '100',
      'bakers flour': '100',
      'sugar': '101',
      'white sugar': '101'
    });
  })
  it('should find the item same case', () => {
    try {
      assert.equal('100', foodItemLookup.findItem('flour'));
    } catch (e) {
      assert.fail(`received unexpected error: ${e}`);
    }
  });
  it('should find the item upper case', () => {
    try {
      assert.equal('100', foodItemLookup.findItem('FLOUR'));
    } catch (e) {
      assert.fail(`receieved unexpected error: ${e}`);
    }
  });
  it('should throw an error when its not found', () => {
    try {
      foodItemLookup.findItem('unknown');
      assert.fail('error expected but got none');
    } catch (e) {
      assert.equal('not found', e.message);
    }
  });
});
describe('buildDictionary', () => {
  it('should build the dictionary', () => {
    const dictionary = buildDictionary({
      '100': [
        'flour',
        'bakers flour'
      ],
      '101': [
        'sugar',
        'white sugar',
        'granular sugar'
      ]
    });
    const expected: Dictionary = {
      'flour': '100',
      'bakers flour': '100',
      'sugar': '101',
      'white sugar': '101',
      'granular sugar': '101',
    };
    assert.deepEqual(expected, dictionary);
  });
});

