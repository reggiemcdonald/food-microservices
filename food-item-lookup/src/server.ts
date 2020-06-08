import express from 'express';
import {readFileSync} from 'fs';
import {join} from 'path';
import FoodItemLookup, {buildDictionary} from './food-item-lookup';

const app: express.Application = express();

const foodItemLookup = new FoodItemLookup(
  buildDictionary(
    JSON.parse(readFileSync(join(__dirname, '../../../data/synonyms.json'), {encoding: 'utf-8'}))
  )
);

app.get('/api/nameLookup', (req, res) => {
  const name: string = req.query.name && req.query.name as string || '';
  if (name === '') {
    res.status(400).send();
    return;
  }
  try {
    console.log(`data is ${JSON.stringify(foodItemLookup.synonyms)}`);
    const id = foodItemLookup.findItem(name);
    res.status(200).send(id);
  } catch (e) {
    res.status(404).send();
  }
});

const startServer = () => {
  const port = process.env.PORT;
  if (!port || port === '') {
    console.log('missing required environment variable PORT');
    return;
  }
  app.listen(port, () => console.log(`listening on ${port}`));
}
startServer();


