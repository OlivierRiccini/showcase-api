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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
const debug = require('debug')('http');
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const auth_service_1 = require("../services/auth-service");
let AuthController = class AuthController {
    constructor() { }
    registerUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokens = yield this.authService.register(user);
            debug('POST /user/register => Successfully registered!');
            return {
                jwt: tokens.accessToken,
                'refresh-token': tokens.refreshToken
            };
        });
    }
    login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens;
            if (credentials.type === 'facebook') {
                tokens = yield this.authService.handleFacebookLogin(credentials);
            }
            else {
                tokens = yield this.authService.login(credentials);
            }
            debug('POST /user/login => Successfully logged in!');
            return {
                jwt: tokens.accessToken,
                'refresh-token': tokens.refreshToken
            };
        });
    }
    refresh(refreshToken, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTokens = yield this.authService.refreshTokens(refreshToken, user.id);
            debug('POST /user/refresh => New Tokens successfully created!');
            return {
                jwt: newTokens.accessToken,
                'refresh-token': newTokens.refreshToken
            };
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authService.logout(refreshToken);
            debug('POST /user/logout => Successfully logged out!');
            return 'Successfully logged out!';
        });
    }
    forgotPassord(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authService.forgotPassword(contact);
            return 'New Password created!';
        });
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", auth_service_1.AuthService)
], AuthController.prototype, "authService", void 0);
__decorate([
    routing_controllers_1.Post('/register'),
    __param(0, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerUser", null);
__decorate([
    routing_controllers_1.Post('/login'),
    __param(0, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    routing_controllers_1.Post('/refresh'),
    __param(0, routing_controllers_1.HeaderParam('refresh-token')), __param(1, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    routing_controllers_1.Post('/logout'),
    __param(0, routing_controllers_1.HeaderParam('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    routing_controllers_1.Post('/forgot-password'),
    __param(0, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassord", null);
AuthController = __decorate([
    routing_controllers_1.JsonController('/auth'),
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth-controller.js.map