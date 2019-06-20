const debug = require('debug')('http');
import {JsonController, Body, Post, Res, HeaderParam} from "routing-controllers";
import { IUser, IUserCredentials, IForgotPassword, IPhone } from "../models/user-model";
import { Service, Inject } from "typedi";
import { AuthService } from "../services/auth-service";
import { SecureService } from "../services/secure-service";

@JsonController('/auth')
@Service()
export class AuthController {
  @Inject() private authService: AuthService;
  @Inject() private secureService: SecureService;
  
  constructor() { }

  @Post('/register')
  async registerUser(@Body() user: IUser) {
    const tokens = await this.authService.register(user);
    debug('POST /auth/register => Successfully registered!');
    return {
      jwt: tokens.accessToken,
      'refresh-token': tokens.refreshToken
    };
  }

  @Post('/login')
  async login(@Body() credentials: IUserCredentials) {
    let tokens: any;
    if (credentials.type === 'facebook') {
      tokens = await this.authService.handleFacebookLogin(credentials);
    } else {
      tokens = await this.authService.login(credentials);
    }
    debug('POST /auth/login => Successfully logged in!');
    return {
      jwt: tokens.accessToken,
      'refresh-token': tokens.refreshToken
    };
  }

  @Post('/email-already-taken')
  async isEmailAlreadyTaken(@Body() email: {email: string}) {
    debug('POST /auth/email-already-taken => Successfully checked!');
    return await this.authService.isEmailAlreadyTaken(email.email);
  }

  @Post('/phone-already-taken')
  async isPhoneAlreadyTaken(@Body() phone: IPhone) {
    debug('POST /auth/phone-already-taken => Successfully checked!');
    return await this.authService.isPhoneAlreadyTaken(phone);
  }

  @Post('/password-is-valid')
  async isPasswordValid(@Body() credentials: IUserCredentials) {
    debug('POST /auth/password-is-valid => Successfully checked!');
    return await this.secureService.isPasswordValid(credentials);
  }

  @Post('/refresh')
  async refresh(@HeaderParam('refresh-token') refreshToken: string, @Body() user: IUser) {
    const newTokens: any = await this.authService.refreshTokens(refreshToken, user.id);
    debug('POST /auth/refresh => New Tokens successfully created!');
    return {
      jwt: newTokens.accessToken,
      'refresh-token': newTokens.refreshToken
    };
  }

  @Post('/logout')
  async logout(@HeaderParam('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    debug('POST /auth/logout => Successfully logged out!');
    return 'Successfully logged out!';
  }

  @Post('/forgot-password')
  async forgotPassord(@Body() contact: IForgotPassword) {
    await this.authService.forgotPassword(contact);
    return 'New Password created!'
  }
 
}
