const debug = require('debug')('seed');
import { UserDAO, IUser } from '../../src/models/user-model';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { MODELS_DATA } from './common-data';
import * as jwt from 'jsonwebtoken';
import { CONSTANTS } from '../../src/persist/constants';
import { OrganizationDAO, IOrganization } from '../../src/models/organization-model';
// import { SecureService } from '../../src/services/secure-service';
var mongoose = require('mongoose');

chai.use(chaiHttp);
var app = require('../../dist/app').app;

export class GeneralHelper {
    constructor() {}

    public cleanDB(): void {
        const db = mongoose.connection;
        db.dropDatabase();
    }

}

export class organizationHelper {
    constructor(private organizationDAO: OrganizationDAO) {}

    public async create(): Promise<IOrganization> {
        return this.organizationDAO.create(MODELS_DATA.Organization[0]);
    }
}

export class UserHelper {
    private request = chai.request(app).keepOpen();

    constructor(private userDAO: UserDAO) {
    }


    public async getUserById(userId: string | number): Promise<any> {
        return this.userDAO.get(userId);
    }

    public async getUserAndToken(user?: IUser): Promise<{ user: IUser, token: string }> {
        const newUser = user ? user : MODELS_DATA.User[0];
        const response = await this.request
            .post('/auth/register')
            .send(newUser)
        
        let token = response.body['jwt'];

        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        const decoded = jwt.verify(token, CONSTANTS.ACCESS_TOKEN_SECRET, null);
        const userResponse = decoded['payload'];
        return { user: userResponse, token };
    }
    
    public async deleteAllUsers(): Promise<any> {
        return this.userDAO.deleteAll();  
    }

    public async delete(userId: string | number): Promise<any> {
        return this.userDAO.delete(userId);
    }

    public getIdByToken(token: string): string {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        const decoded = jwt.verify(token, CONSTANTS.ACCESS_TOKEN_SECRET, null);
        const user = decoded['payload'];
        return user.id;
    }

}
