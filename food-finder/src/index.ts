import express from 'express';
import DefaultSupplierService, { SupplierService } from './supplier';
import DefaultVendorService, { VendorService } from './vendor';
import FoodFinder from './food-finder';

const startServer = () => {
  const app: express.Application = express();
  const port = process.env.PORT;
  const supplierPort = process.env.SUPPLIER_PORT;
  const vendorPort = process.env.VENDOR_PORT;
  if (!port || !supplierPort || !vendorPort) {
    const message = 'one or more environment variables were missing. Ensure that ' + 
      'PORT, SUPPLIER_PORT, and VENDOR_PORT are defined';
    console.log(message);
    return;
  }
  const supplierService = new DefaultSupplierService(`localhost:${supplierPort}`);
  const vendorService = new DefaultVendorService(`localhost:${vendorPort}`);
  const foodFinder = new FoodFinder(supplierService, vendorService);
  app.get('/api/findItem', (req, res) => {
    const itemName: string = req.query.itemName as string;
    foodFinder.findItemByName(itemName)
      .then(report => res.status(200).send(report))
      .catch(e => res.status(403).send({messgae: e.message}));
  });
  app.listen(port, () => console.log(`Food Finder listening on port ${port}`));
};

startServer();