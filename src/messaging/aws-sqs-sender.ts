import { Service } from "typedi";
import { IMessage } from "./message-interfaces";
import { CONSTANTS } from "../persist/constants";

var AWS = require('aws-sdk');

@Service()
export class AWSSqsSender {
  sqs: any;

  constructor() {
    AWS.config.update({region: 'us-east-1'});
    this.sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  }

  public sendMessageToQueue(message: IMessage): void {
    const params = this.buildParams(message);
    this.sqs.sendMessage(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.MessageId);
      }
    });
  }
  
  private buildParams(message: IMessage) {
    let MessageBody: string;
    let QueueUrl: string;
    switch(message.type) {
      case 'email': 
        MessageBody = message.email.content;
        QueueUrl = CONSTANTS.QUEUES.EMAIL;
        break;
      case 'sms':
        MessageBody = message.sms.content;
        QueueUrl = CONSTANTS.QUEUES.SMS;
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

  private buildMessageAttributes(message: IMessage) {
    switch(message.type) {
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
        }
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
        }
      default:
        return;
    }
  }
  
}
