import * as mongoose from 'mongoose';
import { ObjectID } from 'bson';
import { DAOImpl } from '../persist/dao';
import { IPhone } from './user-model';
// import validator from 'validator';
// import { ContactMode } from './shared-interfaces';
// const debug = require('debug')('DAO');

delete mongoose.connection.models['Organization'];


//Interface for model
export interface IOrganization {
    id?: string,
    _id?: ObjectID,
    name: string,
    email: string,
    phones: IPhone[],
    address: string,
    description?: string
}

// Document
export interface OrganizationDocument extends IOrganization, mongoose.Document {
    id: string,
    _id: ObjectID
}

export class OrganizationDAO extends DAOImpl<IOrganization, OrganizationDocument> {
    constructor() {
        const OrganizationSchema = new mongoose.Schema({
            name: String,
            email: String,
            phones: [{
                countryCode: String,
                internationalNumber: String,
                nationalNumber: String,
                number: String,
            }],
            address: String,
            description: String
        });
       
        super('Organization', OrganizationSchema);
    }
}