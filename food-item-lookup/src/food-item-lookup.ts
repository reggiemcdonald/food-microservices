import {Dictionary} from './types';

export default class FoodItemLookup {
  synonyms: Dictionary;
  constructor(synonyms: Dictionary = {}) {
    this.synonyms = synonyms;
  }
  findItem(queryName: string): string {
    queryName = queryName && queryName.toLowerCase();
    if (!this.synonyms[queryName]) {
      throw new Error('not found');
    }
    return this.synonyms[queryName];
  }
}

export const buildDictionary = (synonyms: any): Dictionary => {
  const dictionary: Dictionary = {};
  Object.keys(synonyms).forEach((key: string) => {
    synonyms[key].forEach((synonym: string) => dictionary[synonym] = key);
  });
  return dictionary;
};
