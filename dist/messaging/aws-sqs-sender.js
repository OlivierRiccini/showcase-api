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
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const constants_1 = require("../persist/constants");
var AWS = require('aws-sdk');
let AWSSqsSender = class AWSSqsSender {
    constructor() {
        AWS.config.update({ region: 'us-east-1' });
        this.sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
    }
    sendMessageToQueue(message) {
        const params = this.buildParams(message);
        this.sqs.sendMessage(params, function (err, data) {
            if (err) {
                console.log("Error", err);
            }
            else {
                console.log("Success", data.MessageId);
            }
        });
    }
    buildParams(message) {
        let MessageBody;
        let QueueUrl;
        switch (message.type) {
            case 'email':
                MessageBody = message.email.content;
                QueueUrl = constants_1.CONSTANTS.QUEUES.EMAIL;
                break;
            case 'sms':
                MessageBody = message.sms.content;
                QueueUrl = constants_1.CONSTANTS.QUEUES.SMS;
                break;
            default:
                return;
        }
        return {
            DelaySeconds: 10,
            MessageAttributes: this.buildMessageAttributes(message),
            MessageBody,
            QueueUrl
        };
    }
    buildMessageAttributes(message) {
        switch (message.type) {
            case 'email':
                return {
                    'Type': {
                        DataType: 'String',
                        StringValue: message.type
                    },
                    'From': {
                        DataType: 'String',
                        StringValue: 'info@olivierriccini.com' // TODO: Change
                    },
                    'To': {
                        DataType: 'String',
                        StringValue: message.email.to
                    },
                    'Subject': {
                        DataType: 'String',
                        StringValue: message.email.subject || 'No subject provided'
                    },
                    'Text': {
                        DataType: 'String',
                        StringValue: message.email.content
                    }
                };
            case 'sms':
                return {
                    'Type': {
                        DataType: 'String',
                        StringValue: message.type
                    },
                    'Phone': {
                        DataType: 'String',
                        StringValue: message.sms.phone
                    }
                };
            default:
                return;
        }
    }
};
AWSSqsSender = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], AWSSqsSender);
exports.AWSSqsSender = AWSSqsSender;
//# sourceMappingURL=aws-sqs-sender.js.map