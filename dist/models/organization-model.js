"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const dao_1 = require("../persist/dao");
// import validator from 'validator';
// import { ContactMode } from './shared-interfaces';
// const debug = require('debug')('DAO');
delete mongoose.connection.models['Organization'];
class OrganizationDAO extends dao_1.DAOImpl {
    constructor() {
        const PhoneSchema = new mongoose.Schema({
            countryCode: String,
            internationalNumber: String,
            nationalNumber: String,
            number: String,
        }, { _id: false });
        const OrganizationSchema = new mongoose.Schema({
            name: String,
            email: String,
            phones: [PhoneSchema],
            address: String,
            description: String
        });
        super('Organization', OrganizationSchema);
    }
}
exports.OrganizationDAO = OrganizationDAO;
//# sourceMappingURL=organization-model.js.map