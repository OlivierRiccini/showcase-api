"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const nodemailer = require("nodemailer");
const typedi_1 = require("typedi");
const constants_1 = require("../persist/constants");
const debug = require('debug')('app');
let MailService = class MailService {
    send(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // debug('Sending email via', this.config.host + ':' + this.config.port);
            const transport = this.getConfiguredTransport();
            const mail = this.buildMail(email);
            return new Promise((resolve, reject) => {
                transport.sendMail(mail, (error, info) => {
                    if (error) {
                        console.error('Error sending email', error);
                        reject(error);
                    }
                    else {
                        debug('Successfully sent email', JSON.stringify(info));
                        resolve(info);
                    }
                });
            });
        });
    }
    buildMail(email) {
        const mail = {
            from: `contact@balagnemedical.com`,
            sender: email.from,
            to: email.to,
            subject: email.subject,
            html: email.html
        };
        return mail;
    }
    getConfiguredTransport() {
        return nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            secure: false,
            port: 587,
            tls: {
                ciphers: 'SSLv3'
            },
            auth: {
                user: 'contact@balagnemedical.com',
                pass: constants_1.CONSTANTS.SMTP_AUTH_PASS
            }
        });
    }
};
MailService = __decorate([
    typedi_1.Service()
], MailService);
exports.MailService = MailService;
//# sourceMappingURL=mail-service.js.map