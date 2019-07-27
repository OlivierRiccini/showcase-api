'use strict';
process.env.NODE_ENV = 'test';
var app = require('../../dist/app').app;

import 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { IUser, IUserCredentials, UserDAO, IPhone } from '../../src/models/user-model';
import { CONSTANTS } from '../../src/persist/constants';
import * as jwt from 'jsonwebtoken';
import * as helpers from '../data-test/helpers-data';

const generalHelper: helpers.GeneralHelper = new helpers.GeneralHelper();

const userDAO: UserDAO = new UserDAO();
const userHelper: helpers.UserHelper = new helpers.UserHelper(userDAO);

const expect = chai.expect;
chai.use(chaiHttp);
chai.should();

describe('HTTP - TESTING AUTH ROUTES ./http/auth.test', function() {
  this.timeout(15000);

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

  const VALID_USER_CREDENTIALS_PHONE: IUserCredentials = {
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

  it('POSITIVE - Should signUp a user and get token back', async () => {
    const newUser: IUser = {
      username: 'Steph',
      email: 'steph.curry@warrriors.com',
      password: 'shoot',
    };

    const response = await request
      .post('/auth/register')
      .send(newUser);
       
    expect(response.body).to.have.property('jwt');
    expect(response.body).to.have.property('refresh-token');

    let token = response.body['jwt'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    const decodedJwt =  jwt.verify(token, CONSTANTS.ACCESS_TOKEN_SECRET, null);
    const user = decodedJwt['payload'];

    expect(response.status).to.equal(200);
    expect(user).to.have.property('id');
    expect(user).to.have.property('username');
    expect(user).to.have.property('email');

    await request.post('/auth/logout').set('authorization', token);
  });

  it('POSITIVE - Should login a user using password and email, and get a token back', async () => {
    const response = await request
      .post('/auth/login')
      .send(VALID_USER_CREDENTIALS_EMAIL);
    
    expect(response.body).to.have.property('jwt');
    
    let token = response.body['jwt'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    const decoded =  jwt.verify(token, CONSTANTS.ACCESS_TOKEN_SECRET, null);
    const user = decoded['payload'];
    expect(response.status).to.equal(200);
    expect(user).to.have.property('id');
    expect(user).to.have.property('username');
    expect(user).to.have.property('email');

    await request.post('/auth/logout').set('authorization', VALID_USER_TOKEN);
  });

  it('POSITIVE - Should login a user using password and phone, and get a token', async () => {
      const response = await request
        .post('/auth/login')
        .send(VALID_USER_CREDENTIALS_PHONE);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('jwt');
      
      let token = response.body['jwt'];
      if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
      }
      const decoded =  jwt.verify(token, CONSTANTS.ACCESS_TOKEN_SECRET, null);
      const user = decoded['payload'];
  
      expect(user).to.have.property('id');
      expect(user).to.have.property('username');
      expect(user).to.have.property('phone');
      expect(user.phone).to.have.property('countryCode');
      expect(user.phone).to.have.property('internationalNumber');
      expect(user.phone).to.have.property('nationalNumber');
      expect(user.phone).to.have.property('number');

    await request.del('/auth/logout').set('authorization', VALID_USER_TOKEN);
  });

  it('NEGATIVE - Should not login a user if no type was precised in credentials', async () => {
    const response = await request
      .post('/auth/login')
      .send({phone: null, password: VALID_USER.password});
    
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Credentials should have a property type equal either \'password\' or \'facebook\'');
  });

  it('NEGATIVE - Should not register a user if email is already taken', async () => {
    let newUser: IUser = {
      username: 'New User',
      email: 'lebron.james@lakers.com',
      password: 'IamTheKing',
      phone: {
        countryCode: "US",
        internationalNumber: "+1 666-666-8809",
        nationalNumber: "(666) 666-8809",
        number: "+16666668809"
      },
    };

    const response = await request
      .post('/auth/register')
      .send(newUser);
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Email address already belongs to an account');
  });

  it('NEGATIVE - Should not register a user if phone is already taken', async () => {
    let newUser: IUser = {
      username: 'New User',
      email: 'blabla.blabla@bla.com',
      password: 'IamTheKing',
      phone: {
        countryCode: "US",
        internationalNumber: "+1 438-399-1332",
        nationalNumber: "(438) 399-1332",
        number: "+14383991332"
      }
    };

    const response = await request
      .post('/auth/register')
      .send(newUser);
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Phone number already belongs to an account');
  });

  it('NEGATIVE - Should not register a user if phone is not valid', async () => {
    let newUser: IUser = {
      username: 'New User',
      email: 'ttt.ttt@tt.com',
      password: 'IamTheKing',
      phone: {
        countryCode: "US",
        internationalNumber: "+1 234-000-5654",
        nationalNumber: "(234) 000-5654",
        number: "+123400054" // one digit missed 
      }
    };

    const response = await request
      .post('/auth/register')
      .send(newUser);
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Phone number provided is not valid');
  });

  it('NEGATIVE - Should not register a user if email is not valid', async () => {
    let newUser: IUser = {
      username: 'New User',
      email: 'ttttt.com',
      password: 'IamTheKing',
      phone: {
        countryCode: "US",
        internationalNumber: "+1 898-898-8989",
        nationalNumber: "(898) 898-8989",
        number: "+18989898989"
      }
    };

    const response = await request
      .post('/auth/register')
      .send(newUser);
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Email address provided is not valid');
  });

  it('NEGATIVE - Should not login a user if neither email nor phone provided', async () => {
    const credentials: IUserCredentials = { phone: null, password: 'blaa' };
    const response = await request
      .post('/auth/login')
      .send({ credentials, password: VALID_USER.password});
    
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('User credentials should at least contain an email or a phone property');
  });

  it('NEGATIVE - Should not login a user if email provided is not valid', async () => {
    const response = await request
      .post('/auth/login')
      .send({ email: 'notvalidemail', password: VALID_USER.password});

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Provided email is not valid');
  });

  it('NEGATIVE - Should not login a user if internationalNumber provided is not valid', async () => {
    const phone: IPhone = { 
      number: '4383991332', 
      internationalNumber: '4383991332', // +1 missing 
      nationalNumber: '4383991332', 
      countryCode: 'US' 
    };
    const response = await request
      .post('/auth/login')
      .send({ phone, password: VALID_USER.password});

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Provided phone number is not valid');
  });

  it('NEGATIVE - Should not login a user if phone number format is not valid', async () => {
    const phone: any = {  // {countryCode} missing
      number: '4383991332', 
      internationalNumber: '+14383991332', 
      nationalNumber: '4383991332', 
    };
    const response = await request
      .post('/auth/login')
      .send({ phone, password: VALID_USER.password});

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Provided phone number is not valid');
  });

  it('NEGATIVE - Should not login if user was not found in DB', async () => {
    const response = await request
      .post('/auth/login')
      .send({
          
          phone: {
            countryCode: "US",
            internationalNumber: "+1 343-343-3434",
            nationalNumber: "(343) 343-3434",
            number: "+13434343434"
          },
          password: VALID_USER.password
      });
    
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('User was not found while login');
  });

  it('NEGATIVE - Should not find user in DB if {countryCode} is not valid', async () => {
    const phone: any = {  // {countryCode} missing
      number: '4383991332', 
      internationalNumber: '+14383991332', 
      nationalNumber: '4383991332', 
      countryCode: 'FR' // FR should be US
    };
    const response = await request
      .post('/auth/login')
      .send({ phone, password: VALID_USER.password});

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('User was not found while login');
  });

  it('NEGATIVE - Should not login if possword provided is wrong', async () => {
    const response = await request
      .post('/auth/login')
      .send({ email: VALID_USER.email, password: 'wrongpassword'});
    
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equals('Wrong password');    
  });

  it('POSITIVE - Jwt Token should expire', done => {
    const testDuration: number = Number(CONSTANTS.ACCESS_TOKEN_EXPIRES_IN) + 1000;
    console.log('*********************************************************************************');
    console.log(`Testing Jwt Token should expire...should take max ${(testDuration / 1000)} seconds... 1 / 5`);
    console.log('*********************************************************************************');
    let i = testDuration / 1000 + 1;
    const intervalLogger = setInterval(() => process.stdout.write(` - ${i -= 1} - `), 1000);

      request.post('/auth/login').send(VALID_USER_CREDENTIALS_EMAIL).then(
        response  => {
          const refreshToken = response.body['refresh-token'];
          let token = response.body['jwt'];
          if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
          }
          setTimeout(() => {
            clearInterval(intervalLogger);
            process.stdout.write(`\n`);
            try {
              const payload = jwt.verify(token, CONSTANTS.ACCESS_TOKEN_SECRET, null);
              expect(payload).to.not.have.property('payload');
            } catch (err) {
              expect(err).to.have.property('name').to.equal('TokenExpiredError');
            }
            request.post('/auth/logout').set('refresh-token', refreshToken).then(() => {
              done(); 
            });
          }, Number(CONSTANTS.ACCESS_TOKEN_EXPIRES_IN) + 1000); 
        }
      )
  });

  it.skip('POSITIVE - Refresh should expire', done => {
    const testDuration: number = Number(CONSTANTS.REFRESH_TOKEN_EXPIRES_IN) + 1000;
    console.log('*********************************************************************************');
    console.log(`Testing Refresh should expire...should take max ${(testDuration / 1000)} seconds... 2 / 5`);
    console.log('*********************************************************************************');
    let i = testDuration / 1000 + 1;
    const intervalLogger = setInterval(() => process.stdout.write(` - ${i -= 1} - `), 1000);

    request.post('/auth/login').send(VALID_USER_CREDENTIALS_EMAIL).then(
      response => {
        let refreshToken = response.body['refresh-token'];
        setTimeout(() => {
          clearInterval(intervalLogger);
          process.stdout.write(`\n`);
          try {
            const payload = jwt.verify(refreshToken, CONSTANTS.REFRESH_TOKEN_SECRET + VALID_USER.password, null);
            expect(payload).to.not.have.property('payload');
          } catch (err) {
            expect(err).to.have.property('name').to.equal('TokenExpiredError');
          }
          request.post('/auth/logout').set('refresh-token', refreshToken).then(() => {
            done(); 
          }); 
        }, testDuration); 
      }
    )
  });

  it('POSITIVE - Should return new tokens { jwt, refreshToken } when refreshing', done => {
    const testDuration: number = Number(CONSTANTS.ACCESS_TOKEN_EXPIRES_IN) + 1000;
    console.log('*********************************************************************************');
    console.log(`Testing refreshing tokens...should take max ${(testDuration / 1000)} seconds... 3 / 5`);
    console.log('*********************************************************************************');
    let i = testDuration / 1000 + 1;
    const intervalLogger = setInterval(() => process.stdout.write(` - ${i -= 1} - `), 1000);

    request.post('/auth/login').send(VALID_USER_CREDENTIALS_EMAIL).then(
      registerRespo => {
        const oldJwtToken = registerRespo.body['jwt'];
        const oldRefreshToken = registerRespo.body['refresh-token'];

        setTimeout(() => {
          clearInterval(intervalLogger);
          process.stdout.write(`\n`);
          request.post('/auth/refresh').set('refresh-token', oldRefreshToken).send(VALID_USER).then(
            refreshRespo => {
              try {
                const newJwtToken = refreshRespo.body['jwt'];
                const newRefreshToken = refreshRespo.body['refresh-token'];
                expect(refreshRespo.status).to.equal(200);
                expect(refreshRespo.body).to.have.property('jwt');
                expect(refreshRespo.body).to.have.property('refresh-token');
                expect(newJwtToken).to.not.equals(oldJwtToken);
                expect(newRefreshToken).to.not.equals(oldRefreshToken);
                request.post('/auth/logout').set('refresh-token', newRefreshToken).then(() => {
                  done();
                })
              } catch (err) {
                done(err);
              }
            }); 
        }, testDuration); 
      }
    )
  });

  it('NEGATIVE - Should throw error if refresh token is not provided', done => {
    const testDuration: number = Number(CONSTANTS.ACCESS_TOKEN_EXPIRES_IN) + 1000;
    console.log('*********************************************************************************');
    console.log(`Testing refreshing tokens...should take max ${(testDuration / 1000)} seconds... 4 / 5`);
    console.log('*********************************************************************************');
    let i = testDuration / 1000 + 1;
    const intervalLogger = setInterval(() => process.stdout.write(` - ${i -= 1} - `), 1000);

    request.post('/auth/login').send(VALID_USER_CREDENTIALS_EMAIL).then(
      registerRespo => {
        const oldJwtToken = registerRespo.body['jwt'];
        const oldRefreshToken = registerRespo.body['refresh-token'];

        setTimeout(() => {
          clearInterval(intervalLogger);
          process.stdout.write(`\n`);
          request.post('/auth/refresh').set('refresh-token', null).send(VALID_USER).then(
            refreshRespo => {
              try {
                expect(refreshRespo.status).to.equal(401);
                expect(refreshRespo.body).to.have.property('name');
                expect(refreshRespo.body.name).to.equal('HttpError');
                expect(refreshRespo.body).to.have.property('message');
                expect(refreshRespo.body.message).to.equal('TypeError: Cannot read property \'payload\' of null');
                expect(refreshRespo).to.not.have.property('jwt');
                expect(refreshRespo).to.not.have.property('refresh-token');
                request.post('/auth/logout').set('refresh-token', oldRefreshToken).then(() => {
                  done();
                })
              } catch (err) {
                done(err);
              }
            }); 
        }, testDuration); 
      }
    )
  });

  it('POSITIVE - Should ask to login again if refresh token is expired when refreshing', done => {
    const testDuration: number = Number(CONSTANTS.REFRESH_TOKEN_EXPIRES_IN) + 1000;
    console.log('*********************************************************************************');
    console.log(`Testing refresh token is expired when refreshing...should take max ${(testDuration / 1000)} seconds... 5 / 5`);
    console.log('*********************************************************************************');
    let i = testDuration / 1000 + 1;
    const intervalLogger = setInterval(() => process.stdout.write(` - ${i -= 1} - `), 1000);

    request.post('/auth/login').send(VALID_USER_CREDENTIALS_EMAIL).then(
      response => {
        const refreshToken = response.body['refresh-token'];
          setTimeout(() => {
            process.stdout.write(`\n`);
            clearInterval(intervalLogger);
            
            request
            .post('/auth/refresh')
            .set('refresh-token', refreshToken)
            .send(VALID_USER)
            .then(
              resp => {
                expect(resp.status).to.equal(401);
                expect(resp.body.message).to.equal('Refresh token is no longer valid, user has to login');
                request.post('/auth/logout').set('refresh-token', refreshToken).then(() => {
                  done(); 
                }); 
              }
            )
            .catch(err => done(err));

          }, Number(CONSTANTS.REFRESH_TOKEN_EXPIRES_IN) + 1000);
      }
    )
  });

  it.skip('Should signOut a user by removing secure', async () => {
    const response = await request
      .del('/auth/logout')
      .set('authorization', VALID_USER_TOKEN);
    
    expect(response.status).to.equal(200);
    expect(response.body).to.equal('Successfully logged out!');
  });

  it('POSITIVE - Should return true if email provided is already taken', async () => {
    const newUser: IUser = {
      username: 'TestEmail',
      email: 'email@taken.com',
      password: 'xxx'
    };

    const response = await request
      .post('/auth/register')
      .send(newUser);

    let token = response.body['jwt'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
  
    const response2 = await request
      .post('/auth/email-already-taken')
      .send({email: newUser.email})

    expect(response2.status).to.equal(200);
    expect(response2.body).to.be.true;

    await request.post('/auth/logout').set('authorization', token);
  });

  it('POSITIVE - Should return false if email is already taken but by user himself', async () => {
  
    const response2 = await request
      .post('/auth/email-already-taken')
      .send({phone: VALID_USER.email, userId: VALID_USER.id})

    expect(response2.status).to.equal(200);
    expect(response2.body).to.be.false;

  });

  it('POSITIVE - Should return false if email provided is not already taken', async () => {  
    const response = await request
      .post('/auth/email-already-taken')
      .send({email: 'random.email@unique.com', userId: null})

    expect(response.status).to.equal(200);
    expect(response.body).to.be.false;
  });

  it('POSITIVE - Should return true if phone provided is already taken', async () => {
    const newUser: IUser = {
      username: 'TestEmail',
      email: 'email@email.com',
      phone: {
        countryCode: "US",
        internationalNumber: "+1 234-222-2222",
        nationalNumber: "(234) 222-2222",
        number: "+12342222222"
      },
      password: 'xxx',
    };

    const response = await request
      .post('/auth/register')
      .send(newUser);

    let token = response.body['jwt'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    const userId: string = userHelper.getIdByToken(token);
  
    const response2 = await request
      .post('/auth/phone-already-taken')
      .send({phone: newUser.phone, userId: null})

    expect(response2.status).to.equal(200);
    expect(response2.body).to.be.true;

    await request.post('/auth/logout').set('authorization', token);
  });


  it('POSITIVE - Should return false if phone is already taken but by user himself', async () => {
  
    const response2 = await request
      .post('/auth/phone-already-taken')
      .send({phone: VALID_USER.phone, userId: VALID_USER.id})

    expect(response2.status).to.equal(200);
    expect(response2.body).to.be.false;

  });

  it('POSITIVE - Should return false if phone provided is not already taken', async () => {  
    const response = await request
      .post('/auth/phone-already-taken')
      .send({ phone: {
          countryCode: "US",
          internationalNumber: "+1 222-222-2222",
          nationalNumber: "(222) 222-2222",
          number: "2222222220"
        }, userId: null 
      })

    expect(response.status).to.equal(200);
    expect(response.body).to.be.false;
  });

  it('POSITIVE - Should return false if password provided is wrong', async () => {  
    const response = await request
      .post('/auth/password-is-valid')
      .send({email: 'lebron.james@lakers.com', password: 'wrong'})

    expect(response.status).to.equal(200);
    expect(response.body).to.be.false;
  });

  it('POSITIVE - Should return true if password provided is right', async () => {  
    const response = await request
    .post('/auth/password-is-valid')
      .send({email: 'lebron.james@lakers.com', password: 'IamTheKing'})

    expect(response.status).to.equal(200);
    expect(response.body).to.be.true;
  });

});
