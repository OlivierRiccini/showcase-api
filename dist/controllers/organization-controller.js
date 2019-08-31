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
const organization_service_1 = require("../services/organization-service");
let OrganizationController = class OrganizationController {
    constructor() { }
    //   @UseBefore(Authenticate)
    createOrganization(organization) {
        return __awaiter(this, void 0, void 0, function* () {
            const newOrganization = yield this.organizationService.createOrganization(organization);
            debug('POST /organizations => Successfully created!');
            return newOrganization;
        });
    }
    //   @UseBefore(Authenticate)
    updateOrganization(id, organization) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedOrganization = yield this.organizationService.updateOrganization(organization, id);
            debug(`PUT /organizations/${id}/update => Successfully updated!`);
            return updatedOrganization;
        });
    }
    //   @UseBefore(Authenticate)
    deleteOrganization(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.organizationService.deleteOrganization(id);
            debug(`DEL /organizations/${id} => Successfully deleted!`);
            return 'Organization successfully deleted!';
        });
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", organization_service_1.OrganizationService)
], OrganizationController.prototype, "organizationService", void 0);
__decorate([
    routing_controllers_1.Post('/'),
    __param(0, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createOrganization", null);
__decorate([
    routing_controllers_1.Put('/:id'),
    __param(0, routing_controllers_1.Param('id')), __param(1, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateOrganization", null);
__decorate([
    routing_controllers_1.Delete('/:id'),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "deleteOrganization", null);
OrganizationController = __decorate([
    routing_controllers_1.JsonController('/organizations'),
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], OrganizationController);
exports.OrganizationController = OrganizationController;
//# sourceMappingURL=organization-controller.js.map