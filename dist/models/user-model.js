"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const dao_1 = require("../persist/dao");
const validator_1 = require("validator");
const debug = require('debug')('DAO');
delete mongoose.connection.models['User'];
class UserDAO extends dao_1.DAOImpl {
    constructor() {
        const UserSchema = new mongoose.Schema({
            username: String,
            email: {
                type: String,
                required: true,
                trim: true,
                unique: true,
                validate: {
                    validator: validator_1.default.isEmail
                }
            },
            phone: {
                countryCode: String,
                internationalNumber: String,
                nationalNumber: String,
                number: String
            },
            organizationName: String,
            organizationId: String,
            password: {
                type: String,
                require: true,
                minlength: 6
            },
            isAdmin: Boolean
        });
        super('User', UserSchema);
    }
}
exports.UserDAO = UserDAO;
//# sourceMappingURL=user-model.js.map