import * as config from './config.json';

var env = process.env.NODE_ENV || 'development';
if (env === 'development' || env === 'test' || env === 'production') {
    var envConfig = config[env];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}
