import { Service } from "typedi";
import { IEmailObj } from "src/models/email-model";
import { BadRequestError } from "routing-controllers";

var AWS = require('aws-sdk');

@Service()
export class AwsSESManager {
  sendPromise;

  constructor() {
    const apiVersion: string = '2010-12-01';
    const region: string = 'us-east-1';
    this.init(apiVersion, region);
  }

  public async formatAndSendEmail(message: string): Promise<void> {
    let params: IEmailObj;
    try {
      params = await this.createSendEmailParams(message);
      console.log('Sending email....');
      await this.sendPromise.sendEmail(params).promise();
      console.log('Email sent!');
    } catch(err) {
      throw new BadRequestError(err);
    }
  }

  private init(apiVersion: string, region: string) {
    AWS.config.update({region});
    this.sendPromise = new AWS.SES({apiVersion});
  }

  private async createSendEmailParams(msg): Promise<IEmailObj> {
    // Create sendEmail params 
    return {
      Destination: { /* required */
        // CcAddresses: [
        //   'us-west-2',
        //   /* more items */
        // ],
        ToAddresses: [
          msg.MessageAttributes.To.StringValue,
          /* more items */
        ]
      },
      Message: { /* required */
        Body: { /* required */
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
      Source: msg.MessageAttributes.From.StringValue, /* required */
    //   ReplyToAddresses: [
    //      'EMAIL_ADDRESS',
    //     /* more items */
    //   ],
    };
  }

}
