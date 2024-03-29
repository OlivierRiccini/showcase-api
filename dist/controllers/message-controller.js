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
const mail_service_1 = require("../services/mail-service");
// import { MessagesService } from "../services/messages-service";
// import { IEmail, ISMS } from "../messaging/message-interfaces";
let MessageController = class MessageController {
    constructor() { }
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.mailService.send(email);
                debug('POST /message/email => Email successfully sent!');
                return 'Email successfully sent!';
            }
            catch (err) {
                debug(err.message);
                throw new routing_controllers_1.HttpError(err);
            }
        });
    }
    testMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                debug('POST /messages/test => Test message sent!');
                return `Test message working. You sent ${message.text} to ${message.to}`;
            }
            catch (err) {
                debug(err.message);
            }
        });
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", mail_service_1.MailService)
], MessageController.prototype, "mailService", void 0);
__decorate([
    routing_controllers_1.Post('/email'),
    __param(0, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "sendEmail", null);
__decorate([
    routing_controllers_1.Post('/test'),
    __param(0, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "testMessage", null);
MessageController = __decorate([
    routing_controllers_1.JsonController('/messages'),
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], MessageController);
exports.MessageController = MessageController;
//# sourceMappingURL=message-controller.js.map