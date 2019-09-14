import nodemailer = require('nodemailer');
import { Service } from 'typedi';
import { IEmail } from '../models/email-model';
import { CONSTANTS } from '../persist/constants';
const debug = require('debug')('app');

@Service()
export class MailService {
    
    public async send(email: IEmail): Promise<any> {
        // debug('Sending email via', this.config.host + ':' + this.config.port);
        const transport = this.getConfiguredTransport();
        const mail = this.buildMail(email);
        return new Promise((resolve, reject) => {
        transport.sendMail(mail, (error, info) => {
            if (error) {
            console.error('Error sending email', error);
            reject(error);
            } else {
            debug('Successfully sent email', JSON.stringify(info));
            resolve(info);
            }
        });
        });
    }

    private buildMail(email: IEmail): any {
        const mail = {
        from: `contact@balagnemedical.com`,
        sender: email.from,
        to: email.to,
        subject: email.subject,
        text: email.text
        };
        return mail;
    }

    private getConfiguredTransport(): any {
        return nodemailer.createTransport({
            host: 'smtp-mail.outlook.com', // hostname
            secure: false, // TLS requires secureConnection to be false
            port: 587, // port for secure SMTP
            tls: {
            ciphers:'SSLv3'
            },
            auth: {
                user: 'contact@balagnemedical.com',
                pass: CONSTANTS.SMTP_AUTH_PASS
            }
        })
    }

}