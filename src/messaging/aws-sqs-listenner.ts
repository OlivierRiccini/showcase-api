import { AwsSESManager } from "./aws-ses-manager";
import { Service } from "typedi";
import { AwsSNSManager } from "./aws-sns-manager";
import { CONSTANTS } from "../persist/constants";
import { BadRequestError } from "routing-controllers";
// import { AWSSqsReceiver } from "./aws-sqs-receiver";
const { Consumer } = require('sqs-consumer');
// const events = require('events');

@Service()
export class AWSSqsListenner {
  awsSesManager: AwsSESManager;
  awsSnsManager: AwsSNSManager;
  
  constructor() {
    this.awsSesManager = new AwsSESManager();
    this.awsSnsManager = new AwsSNSManager();
   }
  
  public init() {
    for (const queueUrl in CONSTANTS.QUEUES) {;
      if (CONSTANTS.QUEUES.hasOwnProperty(queueUrl)) {
        this.initListener(CONSTANTS.QUEUES[queueUrl]);
      }
    }
  }

  private initListener(queueUrl: string) {
    const app = Consumer.create({
      queueUrl,
      messageAttributeNames: ["All"],
      handleMessage: async (message) => {
        const queue = queueUrl.split('/')[queueUrl.split('/').length -1];
        await this.formatAndSendMessage(queue, message);
      }
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

  private async formatAndSendMessage(queue: string, message: any) {
    try {
      switch(queue) {
        case 'EMAIL_QUEUE':
          await this.awsSesManager.formatAndSendEmail(message);
          break;
        case 'SMS_QUEUE':
          await this.awsSnsManager.formatAndSendSMS(message);
          break;
        default:
          throw new BadRequestError('Message type provided not recognized');
      }
    } catch (err) { 
      throw new BadRequestError(err);
    }
  }

}
