import { Service, Inject } from "typedi";
import { IUser, UserDAO, IPayload, IUserCredentials} from '../models/user-model';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { CONSTANTS } from "../persist/constants";
import { HttpError } from "routing-controllers";
import { AuthService } from "./auth-service";
const generator = require('generate-password');

export interface ITokens { accessToken: string, refreshToken: string };

@Service()
export class SecureService {
    @Inject(type => AuthService) private authService: AuthService;
    @Inject() private userDAO: UserDAO;

    constructor() {};

    public async generateAuthTokens(user: IUser): Promise<ITokens> {
        try {
            const accessToken = await this.generateAccessToken(user);
            const refreshToken = await this.generateRefreshToken(user);
            return { refreshToken, accessToken };
        } catch (err) {
            throw new HttpError(401, 'Error while generating tokens');
        }
    }

    public async accessTokenIsExpired(token: string): Promise<boolean> {
        try {
            await jwt.verify(token, CONSTANTS.ACCESS_TOKEN_SECRET, null);
        } catch (err) {
            return err.name && err.name === 'TokenExpiredError'
        }
        return false;
    }

    public async validateRefreshToken(refreshToken: string): Promise<void> {
        try {
            const secret: string = await this.getSecretFromRefreshToken(refreshToken);
            jwt.verify(refreshToken, secret, null); 
        } catch (err) {
            if (err.name && err.name === 'TokenExpiredError') {
                throw new Error('Refresh token is no longer valid, user has to login');
            }
            throw new Error(err);
        }
    }
    
    public async refreshTokenIsExpired(refreshToken: string): Promise<boolean> {
        try {
            const secret: string = await this.getSecretFromRefreshToken(refreshToken);
            jwt.verify(refreshToken, secret, null);
        } catch (err) {
            return err.name && err.name === 'TokenExpiredError'
        }
        return false;
    }

    public async generateAccessToken(user: IUser): Promise<string> {
        const payload : IPayload = {
            id: user.id,
            username: user.username,
            email: user.email || null,
            phone: user.phone || null,
            organizationId: user.organizationId || null,
            isAdmin: user.isAdmin || false
        };
        const accessToken = await jwt.sign({payload}, CONSTANTS.ACCESS_TOKEN_SECRET, { expiresIn: CONSTANTS.ACCESS_TOKEN_EXPIRES_IN }).toString();
        return accessToken;
    }

    public async generateRefreshToken(user: IUser): Promise<string> {
        try {
            const payload = { userId: user.id };
            const refreshSecret = CONSTANTS.REFRESH_TOKEN_SECRET + user.password;
            const refreshToken = await jwt.sign({payload}, refreshSecret, { expiresIn: CONSTANTS.REFRESH_TOKEN_EXPIRES_IN }).toString();
            return refreshToken;
        } catch (err) {
            throw new HttpError(404, err.message);
        }
    }

    public async hashPassword(userPassword: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(userPassword, salt, (err, hash) => {
                    if (err) {
                        reject(new Error("Something went wrong while hashing password"));
                    } else {
                        resolve(hash);
                    };
                })
            });
        });
    };

    public async comparePassword(credentialPassword: string, userPassword: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(credentialPassword, userPassword, (err, res) => {
                if (res) {
                    resolve(true);
                } else {
                    reject(new Error('Wrong password'));
                }
            });
        });
    };

    public async isPasswordValid(credentials: IUserCredentials): Promise<boolean> {
        try {
            const query = this.authService.buildQueryFromCredentials(credentials);
            const users = await this.userDAO.find(query);
            const user = users[0];
            await this.comparePassword(credentials.password, user.password);
            return true;
        } catch (err) {
            return false;
        }
    }

    public async updatePassword(password: string, userId: string): Promise<void> {
        try {
            password = await this.hashPassword(password);
            await this.userDAO.update({ password }, userId);
        } catch (err) {
            throw new HttpError(400, err.message);
        }
    } 

    public async generateNewPassword(): Promise<string> {
        const newPassword = generator.generate({
            length: 10,
            numbers: true
        });
        return newPassword;
    }
    
    private async getSecretFromRefreshToken(refreshToken: string): Promise<string> {
        const decodedRefreshToken = jwt.decode(refreshToken);
        const users = await this.userDAO.find({find: { id: decodedRefreshToken['payload'].userId}});
        // TODO: change this way
        if (users.length <= 0) {
            throw new Error('User was not found while refreshing tokens');
        }
        return CONSTANTS.REFRESH_TOKEN_SECRET + users[0].password;
    }


}