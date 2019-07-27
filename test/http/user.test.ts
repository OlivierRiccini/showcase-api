'use strict';
process.env.NODE_ENV = 'test';
var app = require('../../dist/app').app;

import 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { IUser, UserDAO, IUserCredentials } from '../../src/models/user-model';
import * as helpers from '../data-test/helpers-data';
import { SecureService } from '../../src/services/secure-service';
import { assert } from 'chai';

const generalHelper: helpers.GeneralHelper = new helpers.GeneralHelper();

const userDAO: UserDAO = new UserDAO();
const userHelper: helpers.UserHelper = new helpers.UserHelper(userDAO);
const secureService: SecureService = new SecureService();

const expect = chai.expect;
chai.use(chaiHttp);
chai.use(chaiAsPromised)
chai.should();

describe('HTTP - TESTING USER ROUTES ./http/user.test', function() {

  const request = chai.request(app).keepOpen();

  let VALID_USER: IUser = {
    username: 'Lebron',
    email: 'lebron.james@lakers.com',
    password: 'IamTheKing',
    phone: {
      countryCode: "US",
      internationalNumber: "+1 438-399-1332",
      nationalNumber: "(438) 399-1332",
      number: "+14383991332"
    },
  };

  const VALID_USER_CREDENTIALS_EMAIL: IUserCredentials = {
    email: 'lebron.james@lakers.com',
    password: 'IamTheKing'  
  };

  let VALID_USER_TOKEN: string;

  before('Create user', async () => {
    generalHelper.cleanDB();
    const response = await request
      .post('/auth/register')
      .send(VALID_USER);
    let token = response.body['jwt'];
    VALID_USER.id = userHelper.getIdByToken(token);
    VALID_USER_TOKEN = token; 
  });

  after('Cleaning DB', async () => {
    generalHelper.cleanDB();
  });

  it('POSTIVE - Should update user profile', async () => {
    let newUser: IUser = {
      username: 'French user',
      email: 'french@user.fr',
      password: 'zidane',
      phone: {
        countryCode: "FR",
        internationalNumber: "+33 6 74 99 00 99",
        nationalNumber: "06 74 99 00 99",
        number: "0674990099"
      }
    };

    const response = await request
      .post('/auth/register')
      .send(newUser);
    expect(response.status).to.equal(200);

    
    let token = response.body['jwt'];
    const userId: string = userHelper.getIdByToken(token);
    newUser.username = 'Zizou';
    newUser.email = 'zizou@zz.fr';
    
    const response2 = await request
      .put(`/users/${userId}/update`)
      .set('Authorization', VALID_USER_TOKEN)
      .send(newUser);
    expect(response2.status).to.equal(200);
    expect(response2.body.username).to.equal('Zizou');
    expect(response2.body.email).to.equal('zizou@zz.fr');

    await userHelper.delete(userId);
  });

  it('NEGATIVE - Should not update user email address if not valid', async () => {
    VALID_USER.email = 'notvalidemail';

    // Updating
    const response = await request
      .put(`/users/${VALID_USER.id}/update`)
      .set('Authorization', VALID_USER_TOKEN)
      .send(VALID_USER);
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Email address provided is not valid');
  });

  it('NEGATIVE - Should not update user email address is already taken', async () => {
    let user: IUser = {
      username: 'Test USer',
      email: 'test@user.fr',
      password: 'test',
      phone: {
        countryCode: "FR",
        internationalNumber: "+33 6 77 99 99 99",
        nationalNumber: "06 77 99 99 99",
        number: "0677999999"
      }
    };

    const response = await request
      .post('/auth/register')
      .send(user);
    expect(response.status).to.equal(200);

    let token = response.body['jwt'];
    const userId: string = userHelper.getIdByToken(token);

    // Updating our main VALID_USER
    VALID_USER.email = user.email;

    const response2 = await request
      .put(`/users/${VALID_USER.id}/update`)
      .set('Authorization', VALID_USER_TOKEN)
      .send(VALID_USER);
      expect(response2.status).to.equal(400);
      expect(response2.body.message).to.equals('Email address already belongs to an account');
    
    await userHelper.delete(userId);  
  });

  it('NEGATIVE - Should not update user phone number if not valid', async () => {
    VALID_USER.phone = {
      countryCode: "US",
      internationalNumber: "438-399-1332", // missing +1
      nationalNumber: "(438) 399-1332",
      number: "+14383991332"
    };

    // Updating
    const response = await request
      .put(`/users/${VALID_USER.id}/update`)
      .set('Authorization', VALID_USER_TOKEN)
      .send(VALID_USER);
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Phone number provided is not valid');
  });

  it('NEGATIVE - Should not update user if phone number is already taken', async () => {
    let anotherUser: IUser = {
      username: 'Test anotherUser',
      email: 'test@anotherUser.fr',
      password: 'test',
      phone: {
        countryCode: "FR",
        internationalNumber: "+33 6 77 11 11 11",
        nationalNumber: "06 77 11 11 11",
        number: "0677111111"
      }
    };

    const response = await request
      .post('/auth/register')
      .send(anotherUser);
    expect(response.status).to.equal(200);

    let token = response.body['jwt'];
    const userId: string = userHelper.getIdByToken(token);

    // Updating our main VALID_USER
    VALID_USER.phone = anotherUser.phone;

    const response2 = await request
      .put(`/users/${VALID_USER.id}/update`)
      .set('Authorization', VALID_USER_TOKEN)
      .send(VALID_USER);
      expect(response2.status).to.equal(400);
      expect(response2.body.message).to.equals('Phone number already belongs to an account');
    
    await userHelper.delete(userId);  
  });

  it('POSITIVE - Should update user password', async () => {
    let oldPassword: string = VALID_USER.password;
    let newPassword: string = 'new password';

    const response = await request
      .patch(`/users/${VALID_USER.id}/update-password`)
      .set('Authorization', VALID_USER_TOKEN)
      .send({oldPassword, newPassword});

    expect(response.status).to.equal(200);
    expect(response.body).to.equals('Password successfully updated!');

    const userFromDB: IUser = await userHelper.getUserById(VALID_USER.id);
    await expect(secureService.comparePassword(newPassword, userFromDB.password)).to.be.fulfilled;

    // re-update password in case other tests need to use VALID_USER
    oldPassword = newPassword;
    newPassword = VALID_USER.password;

    const response2 = await request
      .patch(`/users/${VALID_USER.id}/update-password`)
      .set('Authorization', VALID_USER_TOKEN)
      .send({oldPassword, newPassword});
    
    expect(response2.status).to.equal(200);
    expect(response2.body).to.equals('Password successfully updated!');
    const userFromDB2: IUser = await userHelper.getUserById(VALID_USER.id);
    await expect(secureService.comparePassword(newPassword, userFromDB2.password)).to.be.fulfilled;

  });

  it('NEGTIVE - Should not update user password if oldPassword is wrong', async () => {
    const wrongOldPassword: string = 'odlpasswordiswrong';
    const rightOldPassword: string = VALID_USER.password;
    const newPassword: string = 'anotherChangePassword';
    
    const response = await request
      .patch(`/users/${VALID_USER.id}/update-password`)
      .set('Authorization', VALID_USER_TOKEN)
      .send({oldPassword: wrongOldPassword, newPassword});

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Wrong password');

    const userFromDB: IUser = await userHelper.getUserById(VALID_USER.id);
    // Password shoudl be the same since it's not been successfully updated
    await expect(secureService.comparePassword(rightOldPassword, userFromDB.password)).to.be.fulfilled;
    return assert.isRejected(secureService.comparePassword(newPassword, userFromDB.password), Error, 'Wrong password');
  
  });

  it('POSITIVE - Should be able to login with new password after reset and make a request', async () => {
    const oldPassword: string = VALID_USER.password;
    const newPassword: string = 'passs';
    
    const response = await request
      .patch(`/users/${VALID_USER.id}/update-password`)
      .set('Authorization', VALID_USER_TOKEN)
      .send({oldPassword, newPassword});

    expect(response.status).to.equal(200);
    expect(response.body).to.equals('Password successfully updated!');

    const userFromDB: IUser = await userHelper.getUserById(VALID_USER.id);
    // Password shoudl be the same since it's not been successfully updated
    await expect(secureService.comparePassword(newPassword, userFromDB.password)).to.be.fulfilled;

    // logging out user
    await request.post('/auth/logout').set('authorization', VALID_USER_TOKEN);

    VALID_USER_CREDENTIALS_EMAIL.password = newPassword;

    const response2 = await request
      .post('/auth/login')
      .send(VALID_USER_CREDENTIALS_EMAIL);
    
    expect(response2.status).to.equal(200);
    expect(response2.body).to.have.property('jwt');
    
    let token = response2.body['jwt'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    VALID_USER_TOKEN = token;

    // making trip request
    const response3 = await request
      .get('/trips')
      .set('Authorization', VALID_USER_TOKEN);

    expect(response3.status).to.equal(200);

    await request.post('/auth/logout').set('authorization', VALID_USER_TOKEN);
  
  });

});
