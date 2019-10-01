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
const auth_service_1 = require("./auth-service");
const routing_controllers_1 = require("routing-controllers");
const secure_service_1 = require("./secure-service");
const mail_service_1 = require("./mail-service");
const constants_1 = require("../persist/constants");
let UserService = class UserService {
    constructor() { }
    updateUser(user, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.authService.emailValidation(user.email, userId);
                return yield this.userDAO.update(user, userId);
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(400, err.message);
            }
        });
    }
    handleChangePassword(userId, oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userDAO.get(userId);
                if (!user) {
                    throw new Error('Change password request rejected since user was not found during process');
                }
                ;
                yield this.secureService.comparePassword(oldPassword, user.password);
                yield this.secureService.updatePassword(newPassword, userId);
                if (process.env.NODE_ENV !== 'test') {
                    yield this.sendMessagesAfterRestePassword(user, newPassword);
                }
                ;
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(400, err.message);
            }
        });
    }
    ;
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userDAO.getAll();
                if (!users) {
                    throw new Error('Something went wrong while retrieving all users');
                }
                return users;
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(404, err.message);
            }
        });
    }
    generateNewUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const generatedPassword = yield this.secureService.generateNewPassword();
                user.password = yield this.secureService.hashPassword(generatedPassword);
                user = yield this.userDAO.create(user);
                yield this.mailService.send({
                    to: user.email,
                    subject: 'Bienvenue chez Balagne Medical Service',
                    html: `
                <p>Bonjour ${user.username.toUpperCase()},
                nous venons de vous donner accès à notre site internet.</p>
                <p>Vous pouvez maintenant vous connecter à votre espace avec les
                identifiants suivants:</p>
                <span>Adresse email: </span><strong>${user.email}</strong>
                <br>
                <span>Mot de passe: </span><strong>${generatedPassword}</strong>
                <br>
                <p>Vous pouvez vous y rendre immediatement en cliquant sur lien suivant:</p>
                <a href="${constants_1.CONSTANTS.BASE_SPA_URL}/pharmacies/auth">M'authentifier</a>
                <br>
                <p>Une fois connecté, vous pourrez modifier votre mot de passe et vos informations</p>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter</p>
                <p>Merci et à bientôt chez Balagne Medical Service</p>
                `
                });
                return user;
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(404, err.message);
            }
        });
    }
    delete(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userDAO.delete(userId);
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(404, err.message);
            }
        });
    }
    sendMessagesAfterRestePassword(user, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.email) {
                yield this.mailService.send({
                    to: user.email,
                    subject: 'Nouveau mot de passe',
                    html: `
                <p>Bonjour ${user.username.toUpperCase()},
                vous venez de changer votre mot de passe.</p>
                <span>Nouveau mot de passe: </span><strong>${newPassword}</strong>
                <br>
                <a href="${constants_1.CONSTANTS.BASE_SPA_URL}/pharmacies/auth">M'authentifier</a>
                `
                });
            }
        });
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", secure_service_1.SecureService)
], UserService.prototype, "secureService", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", user_model_1.UserDAO)
], UserService.prototype, "userDAO", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", auth_service_1.AuthService)
], UserService.prototype, "authService", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", mail_service_1.MailService)
], UserService.prototype, "mailService", void 0);
UserService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user-service.js.map