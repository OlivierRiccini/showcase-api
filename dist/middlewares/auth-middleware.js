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
    // @Inject() private tripDAO: TripDAO;
    // private isAdmin: boolean;
    // constructor(isAdmin: boolean) {
    //     this.isAdmin = isAdmin;
    // }  
    use(request, response, next) {
        let accessToken = request.header('Authorization');
        // console.log('///////////////////// 1 ////////////////////////////');
        // console.log(accessToken);
        try {
            if (!accessToken) {
                throw new routing_controllers_1.HttpError(401, 'No authorization token provided');
            }
            if (accessToken.startsWith('Bearer ')) {
                // Remove Bearer from string
                accessToken = accessToken.slice(7, accessToken.length);
            }
            const decoded = jwt.verify(accessToken, constants_1.CONSTANTS.ACCESS_TOKEN_SECRET, null);
            // console.log('///////////////////// 2 //////////////////////////////');
            if (typeof decoded === 'undefined') {
                throw new routing_controllers_1.HttpError(401, 'Authorizationt token cannot be decoded');
            }
            ;
            const user = decoded['payload'];
            // console.log('//////////////////// 3 //////////////////////////////');
            if (!user) {
                throw new routing_controllers_1.HttpError(401, 'This token is not related to any user');
            }
            ;
            //    if (request.url.includes('/trips') && this.isAdmin) {
            //         const tripId: string = request.params.id;
            //         // const isTripAdmin = await this.isUserTripAdmin(user.id, tripId);
            //         if (!isTripAdmin) {
            //             throw new HttpError(401, 'Only administrator can perform this task');             
            //         };
            //     }
            // console.log('//////////////////// 4 //////////////////////////////');
            // console.log(accessToken);
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
// export class AdminOnly extends Authenticate implements ExpressMiddlewareInterface {
//     constructor() {
//         super(true);
//     }
// }
//# sourceMappingURL=auth-middleware.js.map