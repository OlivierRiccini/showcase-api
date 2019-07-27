"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const jwt = require("jsonwebtoken");
const typedi_1 = require("typedi");
const constants_1 = require("../persist/constants");
let Authenticate = class Authenticate {
    use(request, response, next) {
        let accessToken = request.header('Authorization');
        try {
            if (!accessToken) {
                throw new routing_controllers_1.HttpError(401, 'No authorization token provided');
            }
            if (accessToken.startsWith('Bearer ')) {
                // Remove Bearer from string
                accessToken = accessToken.slice(7, accessToken.length);
            }
            const decoded = jwt.verify(accessToken, constants_1.CONSTANTS.ACCESS_TOKEN_SECRET, null);
            if (typeof decoded === 'undefined') {
                throw new routing_controllers_1.HttpError(401, 'Authorizationt token cannot be decoded');
            }
            ;
            const user = decoded['payload'];
            if (!user) {
                throw new routing_controllers_1.HttpError(401, 'This token is not related to any user');
            }
            ;
            request.user = user;
            request.token = accessToken;
            next();
        }
        catch (err) {
            response.status(err.httpCode ? err.httpCode : 401).send(err);
        }
    }
};
Authenticate = __decorate([
    typedi_1.Service()
], Authenticate);
exports.Authenticate = Authenticate;
//# sourceMappingURL=auth-middleware.js.map