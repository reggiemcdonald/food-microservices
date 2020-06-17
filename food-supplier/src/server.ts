import { newDefaultTracer } from 'food-tracer';
const tracer = newDefaultTracer();

import {join} from 'path';
import * as grpc from 'grpc';
import * as protoloader from '@grpc/proto-loader';
import {readFileSync} from 'fs';
import {Catalog, VendorMap} from './types';
import FoodSupplier, { makeCatalog, makeVendors } from './food-supplier';


const startServer = (): void => {
  const port = process.env.PORT;
  const projectId = process.env.PROJECT_ID;
  if (!port || !projectId) {
    console.log('one or more of PORT and PROJECT_ID are not defined');
    process.exitCode = 1;
    return;
  }
  
  const catalog: Catalog = makeCatalog(
    JSON.parse(readFileSync(join(__dirname, '../../../data/stock.json'), {encoding: 'utf-8'}))
  );
  const vendorMap: VendorMap = makeVendors(
    JSON.parse(readFileSync(join(__dirname, '../../../data/vendors.json'), {encoding: 'utf-8'}))
  );
  const service: any = grpc.loadPackageDefinition(
    protoloader.loadSync(join(__dirname, '../../../proto/food.proto'), {keepCase: true})
  );
  const foodSupplier = new FoodSupplier(tracer, catalog, vendorMap);
  const server = new grpc.Server();
  server.addService(service.FoodSupplier.service, {
    findItem: (call: any, callback: any) => foodSupplier.findItem(call, callback),
  });
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => server.start());
};

startServer();
