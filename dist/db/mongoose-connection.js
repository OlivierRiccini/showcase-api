"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const retry = require("retry");
const debug = require('debug')('data-base');
class MongooseConnection {
    init() {
        let i = 1;
        this.mongoDBUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/showcase-api-dev';
        mongoose.Promise = global.Promise;
        const operation = retry.operation({ retries: 50 });
        operation.attempt(() => {
            mongoose.connect(this.mongoDBUri, {
                useNewUrlParser: true,
                socketTimeoutMS: 60000,
                keepAlive: true,
                connectTimeoutMS: 60000
            })
                .then(() => debug(`Successfully connected DB: ${this.mongoDBUri}`))
                .catch((err) => {
                debug(err);
                debug('Reconnection nb = ' + i++ + ' ...');
                if (operation.retry(err)) {
                    return;
                }
            });
        });
    }
}
exports.MongooseConnection = MongooseConnection;
//# sourceMappingURL=mongoose-connection.js.map