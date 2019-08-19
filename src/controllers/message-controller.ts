const debug = require('debug')('http');
import {JsonController, Body, Post} from "routing-controllers";
import { Service, Inject } from "typedi";
import { MessagesService } from "../services/messages-service";
import { IEmail, ISMS } from "../messaging/message-interfaces";

@JsonController('/messages')
@Service()
export class MessageController {
  @Inject() private messagesService: MessagesService;
  
  constructor() { }

  @Post('/email')
  async sendEmail(@Body() email: IEmail): Promise<string> {
    try {
        await this.messagesService.sendEmail(email);
        debug('POST /message/email => Email successfully sent!');
        return 'Email successfully sent!';
    } catch(err) {
        debug(err.message)
    }
  }

  @Post('/sms')
  async sendsms(@Body() sms: ISMS): Promise<string> {
    try {
        await this.messagesService.sendSMS(sms);
        debug('POST /message/sms => Sms successfully sent!');
        return 'Sms successfully sent!';
    } catch(err) {
        debug(err.message)
    }
  }

  @Post('/test')
  async testMessage(@Body() message: { to: string; text: string }): Promise<string> {
    try {
        debug('POST /messages/test => Test message sent!');
        return  `Test message working. You sent ${message.text} to ${message.to}`;
    } catch(err) {
        debug(err.message)
    }
  }
 
}
