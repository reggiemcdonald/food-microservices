import { newDefaultTracer } from 'food-tracer';

const tracer = newDefaultTracer();

import express from 'express';
import DefaultSupplierService, { SupplierService } from './supplier';
import DefaultVendorService, { VendorService } from './vendor';
import FoodFinder from './food-finder';

const startServer = () => {
  const app: express.Application = express();
  const port = process.env.PORT;
  const supplierPort = process.env.SUPPLIER_PORT;
  const vendorPort = process.env.VENDOR_PORT;
  const projectId = process.env.PROJECT_ID;

  if (!port || !supplierPort || !vendorPort || !projectId) {
    const message = 'one or more environment variables were missing. Ensure that ' + 
      'PORT, SUPPLIER_PORT, VENDOR_PORT, PROJECT_ID are defined';
    console.log(message);
    return;
  }

  const supplierService = new DefaultSupplierService(`food-supplier:${supplierPort}`, tracer);
  const vendorService = new DefaultVendorService(`food-vendor:${vendorPort}`, tracer);
  const foodFinder = new FoodFinder(supplierService, vendorService, tracer);  

  app.get('/api/findItem', (req, res) => {
    const itemName: string = req.query.itemName as string;
    const span = tracer.startSpan('/api/findItem', {
      attributes: {itemName},
    });
    tracer.withSpan(span, () => {
      foodFinder.findItemByName(itemName)
        .then(report => res.status(200).send(report))
        .catch(e => res.status(404).send({message: e.message}))
        .finally(() => span.end());
    });
  });

  app.listen(port, () => console.log(`Food Finder listening on port ${port}`));
};

startServer();
