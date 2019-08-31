'use strict';
var app = require('../../dist/app').app;

import 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { IUser, UserDAO, IUserCredentials } from '../../src/models/user-model';
import * as helpers from '../data-test/helpers-data';
import { SecureService } from '../../src/services/secure-service';
import { assert } from 'chai';
import { OrganizationDAO } from '../../src/models/organization-model';

const generalHelper: helpers.GeneralHelper = new helpers.GeneralHelper();

const userDAO: UserDAO = new UserDAO();
const userHelper: helpers.UserHelper = new helpers.UserHelper(userDAO);
const secureService: SecureService = new SecureService();

const organizationDAO: OrganizationDAO = new OrganizationDAO();
const organizationHelper: helpers.organizationHelper = new helpers.organizationHelper(organizationDAO);

const expect = chai.expect;
chai.use(chaiHttp);
chai.use(chaiAsPromised)
chai.should();

describe('HTTP - TESTING ORGANIZATION ROUTES ./http/organization.test', function() {

  const request = chai.request(app).keepOpen();

//   let VALID_USER: IUser = {
//     username: 'Lebron',
//     email: 'lebron.james@lakers.com',
//     password: 'IamTheKing',
//     phone: {
//       countryCode: "US",
//       internationalNumber: "+1 438-399-1332",
//       nationalNumber: "(438) 399-1332",
//       number: "+14383991332"
//     },
//     organizationId: '333333333333333333333333'
//   };

//   const VALID_USER_CREDENTIALS_EMAIL: IUserCredentials = {
//     email: 'lebron.james@lakers.com',
//     password: 'IamTheKing'  
//   };

//   let VALID_USER_TOKEN: string;

  before('Create user', async () => {
    generalHelper.cleanDB();
    // await organizationHelper.create();
    // const response = await request
    //   .post('/auth/register')
    //   .send(VALID_USER);
    // let token = response.body['jwt'];
    // VALID_USER.id = userHelper.getIdByToken(token);
    // VALID_USER_TOKEN = token;
  });

  after('Cleaning DB', async () => {
    generalHelper.cleanDB();
    // app.close();
  });


});
