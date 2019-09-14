"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("./config.json");
const env = process.env.NODE_ENV || 'development';
if (env === 'development' || env === 'test' || env === 'production') {
    const envConfig = config[env];
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}
//# sourceMappingURL=config.js.map