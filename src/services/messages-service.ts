import { Service, Inject } from "typedi";
import { AWSSqsSender } from "../messaging/aws-sqs-sender";
import { IMessage, IEmail, ISMS } from "src/messaging/message-interfaces";
import { BadRequestError } from "routing-controllers";
// let nodemailer = require('nodemailer');
let aws = require('aws-sdk');

@Service()
export class MessagesService {
    @Inject() private awsSqsSender: AWSSqsSender;
    private transporter: any;

    constructor() {
        //  // create Nodemailer SES transporter
        // aws.config.update({region: 'us-east-1'});
        // this.transporter = nodemailer.createTransport({
        //     SES: new aws.SES({
        //         apiVersion: '2010-12-01'
        //     })
        // });
    }

    public async sendEmail(email: IEmail): Promise<void> {
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
            const messageForQueue: IMessage = { type: 'email', email };
            await this.awsSqsSender.sendMessageToQueue(messageForQueue);
        } catch (err) {
            console.log('olaaaa ' + err);
            if (err.message.includes('Email address is not verified.')) {
                await this.verifySenderEmail(email.from);
            }
            throw new BadRequestError('OOpss something went wrong while sending sms');
        }
    }

    public async sendSMS(sms: ISMS): Promise<void> {
        try {
            const messageForQueue: IMessage = { type: 'sms', sms };
            this.awsSqsSender.sendMessageToQueue(messageForQueue);
        } catch {
            throw new BadRequestError('OOpss something went wrong while sending sms');
        }
    }

    private async verifySenderEmail(emailSender: string): Promise<void> {
        try {
            await new aws.SES({
                apiVersion: '2010-12-01'
            }).verifyEmailIdentity({EmailAddress: emailSender}).promise();
            console.log("Email verification initiated")
        } catch (err) {
            console.error('rerererer ' + err, err.stack)
        }
    }
}