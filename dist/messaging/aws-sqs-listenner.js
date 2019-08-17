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
const aws_ses_manager_1 = require("./aws-ses-manager");
const typedi_1 = require("typedi");
const aws_sns_manager_1 = require("./aws-sns-manager");
const constants_1 = require("../persist/constants");
const routing_controllers_1 = require("routing-controllers");
// import { AWSSqsReceiver } from "./aws-sqs-receiver";
const { Consumer } = require('sqs-consumer');
// const events = require('events');
let AWSSqsListenner = class AWSSqsListenner {
    constructor() {
        this.awsSesManager = new aws_ses_manager_1.AwsSESManager();
        this.awsSnsManager = new aws_sns_manager_1.AwsSNSManager();
    }
    init() {
        for (const queueUrl in constants_1.CONSTANTS.QUEUES) {
            ;
            if (constants_1.CONSTANTS.QUEUES.hasOwnProperty(queueUrl)) {
                this.initListener(constants_1.CONSTANTS.QUEUES[queueUrl]);
            }
        }
    }
    initListener(queueUrl) {
        const app = Consumer.create({
            queueUrl,
            messageAttributeNames: ["All"],
            handleMessage: (message) => __awaiter(this, void 0, void 0, function* () {
                const queue = queueUrl.split('/')[queueUrl.split('/').length - 1];
                yield this.formatAndSendMessage(queue, message);
            })
        });
        app.on('error', (err) => {
            console.log('zeubi 1');
            console.error(err.message);
        });
        app.on('processing_error', (err) => {
            console.log('zeubi 2');
            console.error(err.message);
        });
        app.start();
    }
    formatAndSendMessage(queue, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (queue) {
                    case 'EMAIL_QUEUE':
                        yield this.awsSesManager.formatAndSendEmail(message);
                        break;
                    case 'SMS_QUEUE':
                        yield this.awsSnsManager.formatAndSendSMS(message);
                        break;
                    default:
                        throw new routing_controllers_1.BadRequestError('Message type provided not recognized');
                }
            }
            catch (err) {
                throw new routing_controllers_1.BadRequestError(err);
            }
        });
    }
};
AWSSqsListenner = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], AWSSqsListenner);
exports.AWSSqsListenner = AWSSqsListenner;
//# sourceMappingURL=aws-sqs-listenner.js.map