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
const routing_controllers_1 = require("routing-controllers");
var AWS = require('aws-sdk');
let AwsSESManager = class AwsSESManager {
    constructor() {
        const apiVersion = '2010-12-01';
        const region = 'us-east-1';
        this.init(apiVersion, region);
    }
    formatAndSendEmail(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let params;
            try {
                params = yield this.createSendEmailParams(message);
                console.log('Sending email....');
                yield this.sendPromise.sendEmail(params).promise();
                console.log('Email sent!');
            }
            catch (err) {
                throw new routing_controllers_1.BadRequestError(err);
            }
        });
    }
    init(apiVersion, region) {
        AWS.config.update({ region });
        this.sendPromise = new AWS.SES({ apiVersion });
    }
    createSendEmailParams(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create sendEmail params 
            return {
                Destination: {
                    // CcAddresses: [
                    //   'us-west-2',
                    //   /* more items */
                    // ],
                    ToAddresses: [
                        msg.MessageAttributes.To.StringValue,
                    ]
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: "UTF-8",
                            Data: `<p>${msg.Body}</p><br>`
                        },
                        Text: {
                            Charset: "UTF-8",
                            Data: msg.Body
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: msg.MessageAttributes.Subject.StringValue
                    }
                },
                Source: msg.MessageAttributes.From.StringValue,
            };
        });
    }
};
AwsSESManager = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], AwsSESManager);
exports.AwsSESManager = AwsSESManager;
//# sourceMappingURL=aws-ses-manager.js.map