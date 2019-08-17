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
const aws_sqs_sender_1 = require("../messaging/aws-sqs-sender");
const routing_controllers_1 = require("routing-controllers");
// let nodemailer = require('nodemailer');
let aws = require('aws-sdk');
let MessagesService = class MessagesService {
    constructor() {
        //  // create Nodemailer SES transporter
        // aws.config.update({region: 'us-east-1'});
        // this.transporter = nodemailer.createTransport({
        //     SES: new aws.SES({
        //         apiVersion: '2010-12-01'
        //     })
        // });
    }
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // try {
            //     await this.transporter.sendMail({
            //         from: email.from,
            //         to: email.to,
            //         subject: email.subject,
            //         text: email.content,
            //         // ses: { // optional extra arguments for SendRawEmail
            //         //     Tags: [{
            //             //         Name: 'tag name',
            //             //         Value: 'tag value'
            //             //     }]
            //             // }
            //         })
            //     } catch (err) {
            //         if (err.message.includes('Email address is not verified.')) {
            //         console.log(err);
            //         await this.verifySenderEmail(email.from);
            //     }
            // }
            try {
                const messageForQueue = { type: 'email', email };
                yield this.awsSqsSender.sendMessageToQueue(messageForQueue);
            }
            catch (err) {
                console.log('olaaaa ' + err);
                if (err.message.includes('Email address is not verified.')) {
                    yield this.verifySenderEmail(email.from);
                }
                throw new routing_controllers_1.BadRequestError('OOpss something went wrong while sending sms');
            }
        });
    }
    sendSMS(sms) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messageForQueue = { type: 'sms', sms };
                this.awsSqsSender.sendMessageToQueue(messageForQueue);
            }
            catch (_a) {
                throw new routing_controllers_1.BadRequestError('OOpss something went wrong while sending sms');
            }
        });
    }
    verifySenderEmail(emailSender) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield new aws.SES({
                    apiVersion: '2010-12-01'
                }).verifyEmailIdentity({ EmailAddress: emailSender }).promise();
                console.log("Email verification initiated");
            }
            catch (err) {
                console.error('rerererer ' + err, err.stack);
            }
        });
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", aws_sqs_sender_1.AWSSqsSender)
], MessagesService.prototype, "awsSqsSender", void 0);
MessagesService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], MessagesService);
exports.MessagesService = MessagesService;
//# sourceMappingURL=messages-service.js.map