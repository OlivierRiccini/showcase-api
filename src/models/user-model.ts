import * as mongoose from 'mongoose';
import { ObjectID } from 'bson';
import { DAOImpl } from '../persist/dao';
import validator from 'validator';
const debug = require('debug')('DAO');

delete mongoose.connection.models['User'];

export interface IPhone {
    countryCode: string,
    internationalNumber: string,
    nationalNumber: string,
    number: string
}

export type ContactMode = 
| 'email'
| 'sms'
| 'whatsApp'

//Interface for model
export interface IUser {
    id?: string,
    _id?: ObjectID,
    username?: string,
    email?: string,
    phone?: IPhone,
    simplePhone?: string,
    password: string,
    organizationName?: string,
    organizationId?: string,
    isAdmin?: boolean
}

export interface IUserCredentials {
    username?: string,
    email?: string,
    phone?: IPhone,
    password?: string
}

export interface IForgotPassword {
    type: ContactMode,
    email?: string,
    phone?: IPhone
}

export interface IPayload {
    id: string,
    username: string,
    email?: string,
    phone?: IPhone,
    organizationName?: string,
    organizationId?: string,
    isAdmin?: boolean
}

// Document
export interface UserDocument extends IUser, mongoose.Document {
    id: string,
    _id: ObjectID
}

export class UserDAO extends DAOImpl<IUser, UserDocument> {
    constructor() {
        const UserSchema = new mongoose.Schema({
            username: String,
            email: {
                type: String,
                required: true,
                trim: true,
                unique: true,
                validate: {
                    validator: validator.isEmail
                }
            },
            phone: {
                countryCode: String,
                internationalNumber: String,
                nationalNumber: String,
                number: String
            },
            simplePhone: String,
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