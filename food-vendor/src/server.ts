import {newDefaultTracer} from './trace';

const tracer = newDefaultTracer();

import {readFileSync} from 'fs';
import {join} from 'path';
import * as grpc from 'grpc';
import * as protoloader from '@grpc/proto-loader';
import { VendorMap } from './types';
import FoodVendor, {makeVendors} from './food-vendor';
import { newDefaultMeterProvider } from './meter';

const startServer = () => {
  const vendorMap: VendorMap = makeVendors(
    JSON.parse(readFileSync(join(__dirname, '../../../data/vendors.json'), {encoding: 'utf-8'})),
    JSON.parse(readFileSync(join(__dirname, '../../../data/items.json'), {encoding: 'utf-8'})),
    JSON.parse(readFileSync(join(__dirname, '/../../../data/stock.json'), {encoding: 'utf-8'}))
  );
  const foodVendor = new FoodVendor(vendorMap, tracer, newDefaultMeterProvider());
  const port = process.env.PORT;
  if (!port || port === '') {
    console.log('missing environment variable PORT');
    return;
  }
  const service: any = grpc.loadPackageDefinition(protoloader.loadSync(
    join(__dirname, '../../../proto/food.proto'),
    {keepCase: true}
  ));
  const server = new grpc.Server();
  server.addService(service.FoodVendor.service, {
    getItemAvailability: (call: any, callback: any) => foodVendor.getItemAvailability(call, callback),
  });
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`server listening on port ${port}`);
    server.start();
  });
};
startServer();


