const debug = require('debug')('server');

import "reflect-metadata"; // this shim is required
import {createExpressServer, useContainer} from "routing-controllers";
import { MongooseConnection } from './db/mongoose-connection';
import { Container } from "typedi";

const envFile = process.env.NODE_ENV ? `./config/${process.env.NODE_ENV}.env` : '.env';
require('dotenv').config({ path: envFile });

useContainer(Container);

const PORT = process.env.PORT || 3000;

const app = createExpressServer({
  cors: true,
  controllers: [__dirname + "/controllers/**/*.js"],
  middlewares: [__dirname + "/middlewares/**/*.js"]
});

const mongooseConnection = new MongooseConnection();
mongooseConnection.init();

app.set('port', PORT);

process.on('uncaughtException', (err) => console.log('uncaughtException= ', err));

app.listen(app.get('port'), () => {
  debug(`Server running on port ${PORT}`);
});

module.exports.app = app;
