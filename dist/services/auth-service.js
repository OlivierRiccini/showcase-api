"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const user_model_1 = require("../models/user-model");
const routing_controllers_1 = require("routing-controllers");
const secure_service_1 = require("./secure-service");
const messages_service_1 = require("./messages-service");
const validator_1 = require("validator");
const organization_model_1 = require("../models/organization-model");
// const generator = require('generate-password');
let AuthService = class AuthService {
    constructor() { }
    register(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = req;
                user.password = yield this.secureService.hashPassword(user.password);
                yield this.validateOrganizationId(user);
                if (user.email) {
                    yield this.emailValidation(user.email);
                }
                ;
                if (user.phone) {
                    yield this.phoneValidation(user.phone);
                }
                ;
                user = yield this.userDAO.create(req);
                const tokens = yield this.secureService.generateAuthTokens(user);
                return tokens;
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(400, err.message);
            }
        });
    }
    ;
    login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.validateCredentials(credentials);
                const query = this.buildQueryFromCredentials(credentials);
                let users = yield this.userDAO.find(query);
                if (!users || users.length <= 0) {
                    throw new Error('User was not found while login');
                }
                let user = users[0];
                yield this.secureService.comparePassword(credentials.password, user.password);
                const tokens = yield this.secureService.generateAuthTokens(user);
                return tokens;
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(400, err.message);
            }
        });
    }
    ;
    refreshTokens(refreshToken, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userDAO.get(userId);
                yield this.secureService.validateRefreshToken(refreshToken);
                const tokens = yield this.secureService.generateAuthTokens(user);
                return tokens;
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(401, err.message);
            }
        });
    }
    forgotPassword(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            let user, newPassword;
            try {
                user = yield this.findUserByEmailOrPhone(contact.email, contact.phone);
                newPassword = yield this.secureService.generateNewPassword();
                yield this.secureService.updatePassword(newPassword, user.id);
                yield this.sendMessagesAfterForgotPassword(contact, newPassword);
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(400, err.message);
            }
        });
    }
    isEmailAlreadyTaken(email, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userDAO.find({ find: { email } });
            return users.length > 0 && !users.some(user => user.id === userId);
        });
    }
    isPhoneAlreadyTaken(phone, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userDAO.find({
                find: { 'phone.internationalNumber': phone.internationalNumber }
            });
            return users.length > 0 && !users.some(user => user.id === userId);
        });
    }
    emailValidation(email, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isEmailAlreadyTaken(email, userId || null)) {
                throw new Error('Email address already belongs to an account');
            }
            if (!validator_1.default.isEmail(email)) {
                throw new Error('Email address provided is not valid');
            }
        });
    }
    phoneValidation(phone, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isPhoneAlreadyTaken(phone, userId || null)) {
                throw new Error('Phone number already belongs to an account');
            }
            if (!this.isPhoneFormatValid(phone)) {
                throw new Error('Phone number provided is not valid');
            }
        });
    }
    buildQueryFromCredentials(credentials) {
        let query;
        if (credentials.email) {
            query = { find: { email: credentials.email } };
        }
        if (credentials.phone) {
            query = {
                find: {
                    'phone.countryCode': credentials.phone.countryCode,
                    // MORE FLEXIBLE
                    $or: [
                        { 'phone.number': credentials.phone.internationalNumber },
                        { 'phone.internationalNumber': credentials.phone.internationalNumber },
                        { 'phone.nationalNumber': credentials.phone.nationalNumber }
                    ]
                    // 'phone.number': credentials.phone.number,
                    // 'phone.internationalNumber': credentials.phone.internationalNumber,
                    // 'phone.nationalNumber': credentials.phone.nationalNumber,
                }
            };
        }
        return query;
    }
    validateOrganizationId(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user.organizationId) {
                throw new Error('Cannot register user with no organizationId');
            }
            ;
            try {
                const organization = yield this.organizationDAO.get(user.organizationId);
                if (!organization) {
                    throw new Error('Organization id provided is not valid');
                }
            }
            catch (err) {
                throw new Error('Organization id provided is not valid');
            }
        });
    }
    findUserByEmailOrPhone(email, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = email ? { email } : { phone };
            const users = yield this.userDAO.find({ find: query });
            if (!users || users.length < 1 || users.length > 1) {
                throw new routing_controllers_1.HttpError(400, 'No user or more than one user found during password reinitilization process');
            }
            return users[0];
        });
    }
    validateCredentials(credentials) {
        if (!this.credentialsHaveEmail(credentials) && !this.credentialsHavePhone(credentials)) {
            throw new Error('User credentials should at least contain an email or a phone property');
        }
        if (this.credentialsHaveEmail(credentials) && !validator_1.default.isEmail(credentials.email)) {
            throw new Error('Provided email is not valid');
        }
        if (this.credentialsHavePhone(credentials)
            && !this.isPhoneFormatValid(credentials.phone)) {
            throw new Error('Provided phone number is not valid');
        }
    }
    credentialsHaveEmail(credentials) {
        return credentials.hasOwnProperty('email') && !!credentials.email;
    }
    credentialsHavePhone(credentials) {
        return credentials.hasOwnProperty('phone');
    }
    isPhoneFormatValid(phone) {
        const allPropertiesPresent = phone.hasOwnProperty('number')
            && phone.hasOwnProperty('internationalNumber')
            && phone.hasOwnProperty('nationalNumber')
            && phone.hasOwnProperty('countryCode');
        if (!allPropertiesPresent) {
            return false;
        }
        const formatedPhoneNumber = phone.internationalNumber.replace(/\s|\-|\(|\)/gm, '');
        return validator_1.default.isMobilePhone(formatedPhoneNumber, 'any', { strictMode: true });
    }
    sendMessagesAfterForgotPassword(contact, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            let user;
            switch (contact.type) {
                case 'email':
                    user = yield this.findUserByEmailOrPhone(contact.email, null);
                    yield this.messagesService.sendEmail({
                        from: 'info@olivierriccini.com',
                        to: contact.email,
                        subject: 'New Password',
                        content: `Hey ${user.username.toUpperCase()},
                              this is your new password: ${newPassword}. 
                              You can go to your profile to change it`
                    });
                    break;
                case 'sms':
                    user = yield this.findUserByEmailOrPhone(null, contact.phone);
                    yield this.messagesService.sendSMS({
                        phone: contact.phone.internationalNumber,
                        content: `Hey ${user.username.toUpperCase()},
                            this is your new password: ${newPassword}. 
                            You can go to your profile to change it`
                    });
                    break;
                default:
                    throw new Error('Something went wrong while reinitilizing password');
            }
        });
    }
};
__decorate([
    typedi_1.Inject(type => secure_service_1.SecureService),
    __metadata("design:type", secure_service_1.SecureService)
], AuthService.prototype, "secureService", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", user_model_1.UserDAO)
], AuthService.prototype, "userDAO", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", organization_model_1.OrganizationDAO)
], AuthService.prototype, "organizationDAO", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", messages_service_1.MessagesService)
], AuthService.prototype, "messagesService", void 0);
AuthService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth-service.js.map