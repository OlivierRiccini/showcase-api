"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./config/config.js');
const debug = require('debug')('server');
require("reflect-metadata"); // this shim is required
const routing_controllers_1 = require("routing-controllers");
const mongoose_connection_1 = require("./db/mongoose-connection");
const typedi_1 = require("typedi");
routing_controllers_1.useContainer(typedi_1.Container);
const app = routing_controllers_1.createExpressServer({
    cors: true,
    controllers: [__dirname + "/controllers/**/*.js"],
    middlewares: [__dirname + "/middlewares/**/*.js"]
});
const mongooseConnection = new mongoose_connection_1.MongooseConnection();
mongooseConnection.init();
app.set("port", process.env.PORT);
app.listen(app.get("port"), () => {
    debug(`Server running on port ${app.get("port")}`);
});
module.exports.app = app;
//# sourceMappingURL=app.js.map