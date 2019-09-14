import { Service, Inject } from "typedi";
import { UserDAO, IUserCredentials, IForgotPassword, IUser, IPhone } from '../models/user-model';
import { HttpError } from "routing-controllers";
import { SecureService } from "./secure-service";
import validator from 'validator';
import { MailService } from "./mail-service";

@Service()
export class AuthService {
    @Inject(type => SecureService) private secureService: SecureService;
    @Inject() private userDAO: UserDAO; 
    @Inject() private mailService: MailService;
    
    constructor() { }

    public async register(req: any): Promise<any> {         
        try {
            let user = req;
            user.password = await this.secureService.hashPassword(user.password);
            // await this.validateOrganizationId(user);
            if (user.email) { await this.emailValidation(user.email) };
            if (user.phone) { await this.phoneValidation(user.phone) };
            user = await this.userDAO.create(req);
            const tokens = await this.secureService.generateAuthTokens(user);
            return tokens;
        } catch (err) {
            throw new HttpError(400, err.message);
        }
    };

    public async login(credentials: IUserCredentials): Promise<any> {
        try {
            this.validateCredentials(credentials);
            const query = this.buildQueryFromCredentials(credentials);
            let users = await this.userDAO.find(query);
            if (!users || users.length <= 0) {
                throw new Error('User was not found while login');
            }
            let user = users[0];
            await this.secureService.comparePassword(credentials.password, user.password);
            const tokens = await this.secureService.generateAuthTokens(user);  
            return tokens;
        } catch (err) {
            throw new HttpError(400, err.message);
        }
    };

    public async refreshTokens(refreshToken: string, userId: string) {
        try {
            const user: IUser= await this.userDAO.get(userId);
            await this.secureService.validateRefreshToken(refreshToken);
            const tokens = await this.secureService.generateAuthTokens(user);
            return tokens;
        } catch (err) {
            throw new HttpError(401, err.message);
        }
    }

    public async forgotPassword(contact: IForgotPassword) {
        let user: IUser, newPassword: string;
        try {
            user = await this.findUserByEmailOrPhone(contact.email, contact.phone);
            newPassword = await this.secureService.generateNewPassword();
            await this.secureService.updatePassword(newPassword, user.id);
            await this.sendMessagesAfterForgotPassword(contact, newPassword);
        } catch (err) {
            throw new HttpError(400, err.message);
        }
    }

    public async isEmailAlreadyTaken(email: string, userId?: string): Promise<boolean> {
        const users: IUser[] = await this.userDAO.find({find: { email }});
        return users.length > 0 && !users.some(user => user.id === userId);
    }

    public async isPhoneAlreadyTaken(phone: IPhone, userId?: string): Promise<boolean> {
        const users: IUser[] = await this.userDAO.find({
            find: { 'phone.internationalNumber': phone.internationalNumber }
        });
        return users.length > 0 && !users.some(user => user.id === userId);
    }

    public async emailValidation(email: string, userId?: string): Promise<void> {  
        if (await this.isEmailAlreadyTaken(email, userId || null)) {
            throw new Error('Email address already belongs to an account');
        }
        if (!validator.isEmail(email)) {
            throw new Error('Email address provided is not valid');
        }
    }

    public async phoneValidation(phone: IPhone, userId?: string): Promise<void> {
        if (await this.isPhoneAlreadyTaken(phone, userId || null)) {
            throw new Error('Phone number already belongs to an account');
        }
        
        if (!this.isPhoneFormatValid(phone)) {
            throw new Error('Phone number provided is not valid');
        }
    }

    public buildQueryFromCredentials(credentials: IUserCredentials): { find: {} } {
        let query: { find: {} };
        if (credentials.email) {
            query = { find: { email: credentials.email } };
        }
        if (credentials.phone) {
            query = { 
                find: { 
                    'phone.countryCode': credentials.phone.countryCode,
                    // MORE FLEXIBLE
                    $or: [
                        {'phone.number': credentials.phone.internationalNumber}, 
                        {'phone.internationalNumber': credentials.phone.internationalNumber}, 
                        {'phone.nationalNumber': credentials.phone.nationalNumber}
                    ]
                    // 'phone.number': credentials.phone.number,
                    // 'phone.internationalNumber': credentials.phone.internationalNumber,
                    // 'phone.nationalNumber': credentials.phone.nationalNumber,
                }
            }
        }
        return query;
    }

    // private async validateOrganizationId(user: IUser): Promise<void> {
        // if (!user.organizationId) {
        //     throw new Error('Cannot register user with no organizationId');
        // };
        // try {
        //     const organization: IOrganization = await this.organizationDAO.get(user.organizationId);
        //     if (!organization) {
        //         throw new Error('Organization id provided is not valid');
        //     }
        // } catch (err) {
        //     throw new Error('Organization id provided is not valid');
        // }
    // }

    private async findUserByEmailOrPhone(email: string, phone: IPhone): Promise<IUser> {
        const query = email ? { email} : { phone };
        const users = await this.userDAO.find({find: query});
        if (!users || users.length < 1 || users.length > 1) {
            throw new HttpError(400, 'No user or more than one user found during password reinitilization process')
        }
        return users[0];
    }

    private validateCredentials(credentials: IUserCredentials): void {
        if (!this.credentialsHaveEmail(credentials) && !this.credentialsHavePhone(credentials)) {
            throw new Error('User credentials should at least contain an email or a phone property');
        }
        
        if (this.credentialsHaveEmail(credentials) && !validator.isEmail(credentials.email)) {
            throw new Error('Provided email is not valid');
        }
        if (this.credentialsHavePhone(credentials)
            && !this.isPhoneFormatValid(credentials.phone)) {
            throw new Error('Provided phone number is not valid');
        }
    }

    private credentialsHaveEmail(credentials: IUserCredentials): boolean {
        return credentials.hasOwnProperty('email') && !!credentials.email;
    }

    private credentialsHavePhone(credentials: IUserCredentials): boolean {
        return credentials.hasOwnProperty('phone');
    }

    private isPhoneFormatValid(phone: IPhone): boolean {
        const allPropertiesPresent: boolean = phone.hasOwnProperty('number')
                                              && phone.hasOwnProperty('internationalNumber')
                                              && phone.hasOwnProperty('nationalNumber')
                                              && phone.hasOwnProperty('countryCode');
        if (!allPropertiesPresent) {
            return false;
        }
        const formatedPhoneNumber: string = phone.internationalNumber.replace(/\s|\-|\(|\)/gm, '');
        return validator.isMobilePhone(formatedPhoneNumber, 'any', {strictMode: true});
    }

    private async sendMessagesAfterForgotPassword(contact: IForgotPassword, newPassword: string): Promise<void> {
        let user: IUser;
        switch(contact.type) {
            case 'email':
                user = await this.findUserByEmailOrPhone(contact.email, null);
                await this.mailService.send({
                    from: 'info@olivierriccini.com',
                    to: contact.email,
                    subject: 'New Password',
                    text: `Hey ${user.username.toUpperCase()},
                              this is your new password: ${newPassword}. 
                              You can go to your profile to change it`
                });
                break;
            case 'sms':
                // user = await this.findUserByEmailOrPhone(null, contact.phone);
                // await this.mailService.sendSMS({
                //     phone: contact.phone.internationalNumber,
                //     content: `Hey ${user.username.toUpperCase()},
                //             this is your new password: ${newPassword}. 
                //             You can go to your profile to change it`
                // });
                break;
            default:
                throw new Error('Something went wrong while reinitilizing password');
        }
    }
}