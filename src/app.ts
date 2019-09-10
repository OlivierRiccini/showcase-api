require('./config/config.js')

const debug = require('debug')('server');

import "reflect-metadata"; // this shim is required
import {createExpressServer, useContainer} from "routing-controllers";
import { MongooseConnection } from './db/mongoose-connection';
import {Container} from "typedi";
// import { AmqReceiver } from "./messaging/receive";
import { AWSSqsListenner } from "./messaging/aws-sqs-listenner";

useContainer(Container);
 
// creates express app, registers all controller routes and returns you express app instance
const app = createExpressServer({
  cors: true,
  controllers: [__dirname + "/controllers/**/*.js"],
  middlewares: [__dirname + "/middlewares/**/*.js"]
});

const mongooseConnection = new MongooseConnection();
mongooseConnection.init();

const awsSqsListenner = new AWSSqsListenner();
awsSqsListenner.init();

app.set("port", process.env.PORT);

app.listen(app.get("port"), () => {
  debug(`Server running on port ${app.get("port")}`);
});

module.exports.app = app;
module.exports.mongooseConnection = mongooseConnection;