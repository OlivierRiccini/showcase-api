import mongoose = require('mongoose');
import * as retry from 'retry';
const debug = require('debug')('data-base');

export class MongooseConnection {
    public init() {
        let i = 1;
        mongoose.Promise = global.Promise;
        const operation = retry.operation({retries: 50});

        operation.attempt(() => {
            mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
                .then(() => debug(`Successfully connected DB: ${process.env.MONGODB_URI}`))
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
