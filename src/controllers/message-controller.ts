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
  async sendEmail(@Body() email: IEmail): Promise<void> {
    try {
        await this.messagesService.sendEmail(email);
        debug('POST /message/email => Email successfully sent!');
    } catch(err) {
        debug(err.message)
    }
  }

  @Post('/sms')
  async sendsms(@Body() sms: ISMS): Promise<void> {
    try {
        await this.messagesService.sendSMS(sms);
        debug('POST /message/sms => Sms successfully sent!');
    } catch(err) {
        debug(err.message)
    }
  }
 
}
