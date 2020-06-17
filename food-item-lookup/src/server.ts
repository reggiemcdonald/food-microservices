import {newDefaultTracer} from 'food-tracer';

const tracer = newDefaultTracer();

import {SpanKind} from '@opentelemetry/api';
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
  const span = tracer.startSpan('/api/nameLookup', {
    attributes: {
      name,
    },
    parent: tracer.getCurrentSpan(),
    kind: SpanKind.SERVER,
  });
  tracer.withSpan(span, () => {
    if (name === '') {
      res.status(400).send();
      span.addEvent('error: find-item-lookup', {
        message: 'item name was empty',
      });
      span.end();
      return;
    }
    try {
      const id = foodItemLookup.findItem(name);
      res.status(200).send(id);
    } catch (e) {
      span.addEvent('error: find-item-lookup', {
        message: e.message,
      });
      res.status(404).send();
    } finally {
      span.end();
    }
  });
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


