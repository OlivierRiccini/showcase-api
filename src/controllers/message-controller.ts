const debug = require('debug')('http');
import {JsonController, Body, Post, HttpError} from "routing-controllers";
import { Service, Inject } from "typedi";
import { MailService } from "../services/mail-service";
import { IEmail } from "../models/email-model";
// import { MessagesService } from "../services/messages-service";
// import { IEmail, ISMS } from "../messaging/message-interfaces";

@JsonController('/messages')
@Service()
export class MessageController {
  @Inject() private mailService: MailService;
  
  constructor() { }

  @Post('/email')
  async sendEmail(@Body() email: IEmail): Promise<string> {
    try {
        await this.mailService.send(email);
        debug('POST /message/email => Email successfully sent!');
        return 'Email successfully sent!';
    } catch(err) {
      debug(err.message)
      throw new HttpError(err);
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
