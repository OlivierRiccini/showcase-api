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
const trip_service_1 = require("../services/trip-service");
const typedi_1 = require("typedi");
const auth_middleware_1 = require("../middlewares/auth-middleware");
let TripController = class TripController {
    constructor() { }
    getAllTrips(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let trips = yield this.tripService.findTrips(request.user.id);
            debug('GET /trips => ' + JSON.stringify(trips));
            return trips;
        });
    }
    getTripById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('GET /trip by id');
            let trip = yield this.tripService.findById(id);
            debug('GET /trip by id => ' + JSON.stringify(trip));
            return trip;
        });
    }
    addTrip(trip, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTrip = yield this.tripService.createTrip(trip);
            debug('POST /trip => ' + JSON.stringify(newTrip));
            return newTrip;
        });
    }
    updateTrip(trip, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedTrip = yield this.tripService.updateTrip(trip, id);
            debug('PUT /trip => ' + JSON.stringify(updatedTrip));
            return updatedTrip;
        });
    }
    deleteTrip(id) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('DELETE /trip by id');
            const response = yield this.tripService.deleteTrip(id);
            debug('DELETE /trip by id => ' + JSON.stringify(response));
            return response;
        });
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", trip_service_1.TripService)
], TripController.prototype, "tripService", void 0);
__decorate([
    routing_controllers_1.Get(),
    routing_controllers_1.UseBefore(auth_middleware_1.Authenticate),
    __param(0, routing_controllers_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "getAllTrips", null);
__decorate([
    routing_controllers_1.Get('/:id'),
    routing_controllers_1.UseBefore(auth_middleware_1.Authenticate),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "getTripById", null);
__decorate([
    routing_controllers_1.Post(),
    routing_controllers_1.UseBefore(auth_middleware_1.Authenticate),
    __param(0, routing_controllers_1.Body()), __param(1, routing_controllers_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "addTrip", null);
__decorate([
    routing_controllers_1.Put('/:id'),
    routing_controllers_1.UseBefore(auth_middleware_1.Authenticate),
    __param(0, routing_controllers_1.Body()), __param(1, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "updateTrip", null);
__decorate([
    routing_controllers_1.Delete('/:id'),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "deleteTrip", null);
TripController = __decorate([
    routing_controllers_1.JsonController('/trips'),
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], TripController);
exports.TripController = TripController;
//# sourceMappingURL=trip-controller.js.map