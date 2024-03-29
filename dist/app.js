"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require('debug')('server');
require("reflect-metadata"); // this shim is required
const routing_controllers_1 = require("routing-controllers");
const mongoose_connection_1 = require("./db/mongoose-connection");
const typedi_1 = require("typedi");
const envFile = process.env.NODE_ENV ? `./config/${process.env.NODE_ENV}.env` : '.env';
require('dotenv').config({ path: envFile });
routing_controllers_1.useContainer(typedi_1.Container);
const PORT = process.env.PORT || 3000;
const app = routing_controllers_1.createExpressServer({
    cors: true,
    controllers: [__dirname + "/controllers/**/*.js"],
    middlewares: [__dirname + "/middlewares/**/*.js"]
});
const mongooseConnection = new mongoose_connection_1.MongooseConnection();
mongooseConnection.init();
app.set('port', PORT);
process.on('uncaughtException', (err) => console.log('uncaughtException= ', err));
app.listen(app.get('port'), () => {
    debug(`Server running on port ${PORT}`);
});
module.exports.app = app;
//# sourceMappingURL=app.js.map