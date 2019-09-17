import mongoose = require('mongoose');
import * as retry from 'retry';
const debug = require('debug')('data-base');

export class MongooseConnection {
    private mongoDBUri: string;

    public init() {
        let i = 1;
        this.mongoDBUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/showcase-api-dev';
        mongoose.Promise = global.Promise;
        const operation = retry.operation({retries: 50});

        operation.attempt(() => {
            mongoose.connect(this.mongoDBUri, { useNewUrlParser: true })
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
