export type Catalog = {[key: string]: string[]}
export type VendorMap = {[key: string]: string}

export interface IdFinder {
  getItemIdFromSynonym(synonym: string): Promise<string>;
}
