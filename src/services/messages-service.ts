import { Service, Inject } from "typedi";
import { AWSSqsSender } from "../messaging/aws-sqs-sender";
import { IMessage, IEmail, ISMS } from "src/messaging/message-interfaces";
import { BadRequestError } from "routing-controllers";
let nodemailer = require('nodemailer');
let aws = require('aws-sdk');
// configure AWS SDK
// aws.config.loadFromPath('config.json');
//  // create Nodemailer SES transporter
// let transporter = nodemailer.createTransport({
//     SES: new aws.SES({
//         apiVersion: '2010-12-01'
//     })
// });

@Service()
export class MessagesService {
    @Inject() private awsSqsSender: AWSSqsSender;
    private transporter: any;

    constructor() {
         // create Nodemailer SES transporter
        aws.config.update({region: 'us-east-1'});
        this.transporter = nodemailer.createTransport({
            SES: new aws.SES({
                apiVersion: '2010-12-01'
            })
        });
    }

    public async sendEmail(email: IEmail): Promise<void> {
           // send some mail
        this.transporter.sendMail({
            from: email.from,
            to: email.from,
            subject: email.subject,
            text: email.content,
            // ses: { // optional extra arguments for SendRawEmail
            //     Tags: [{
            //         Name: 'tag name',
            //         Value: 'tag value'
            //     }]
            // }
        }, (err, info) => {
            console.log(err);
            if (info) {
                console.log(info);
            }
        });
        // try {
        //     const messageForQueue: IMessage = { type: 'email', email };
        //     await this.awsSqsSender.sendMessageToQueue(messageForQueue);
        // } catch {
        //     throw new BadRequestError('OOpss something went wrong while sending email');
        // }
    }

    public async sendSMS(sms: ISMS): Promise<void> {
        try {
            const messageForQueue: IMessage = { type: 'sms', sms };
            this.awsSqsSender.sendMessageToQueue(messageForQueue);
        } catch {
            throw new BadRequestError('OOpss something went wrong while sending sms');
        }
    }
}