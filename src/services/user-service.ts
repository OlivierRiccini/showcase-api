import { Service, Inject } from "typedi";
import { IUser, UserDAO } from "../models/user-model";
import { AuthService } from "./auth-service";
import { HttpError } from "routing-controllers";
import { SecureService } from "./secure-service";
import { MessagesService } from "./messages-service";

@Service()
export class UserService {
    @Inject() private secureService: SecureService;
    @Inject() private userDAO: UserDAO;
    @Inject() private authService: AuthService;
    @Inject() private messagesService: MessagesService;
    
    constructor() { }

    public async updateUser(user: IUser, userId: string): Promise<IUser> {
        try {
            await this.authService.emailValidation(user.email, userId);
            await this.authService.phoneValidation(user.phone, userId);
            return await this.userDAO.update(user, userId);
        } catch (err) {
            throw new HttpError(400, err.message);
        }
    }

    public async handleChangePassword(userId: string, oldPassword: string, newPassword: string): Promise<any> {
        try {
            const user: IUser = await this.userDAO.get(userId);
            if (!user) { throw new Error('Change password request rejected since user was not found during process') };
            await this.secureService.comparePassword(oldPassword, user.password);   
            await this.secureService.updatePassword(newPassword, userId);
            if (process.env.NODE_ENV !== 'test') { 
                await this.sendMessagesAfterRestePassword(user, newPassword) 
            };
        } catch (err) {
            throw new HttpError(400, err.message);
        }
    };

    private async sendMessagesAfterRestePassword(user: IUser, newPassword: string): Promise<void> {
        if (user.email) {
            await this.messagesService.sendEmail({
                from: 'info@olivierriccini.com',
                to: user.email,
                subject: 'New Password',
                content: `Hey ${user.username.toUpperCase()}, you just reste your password, this is your new one: ${newPassword}`
            });
        }
        if (user.phone && user.phone.internationalNumber) {
            await this.messagesService.sendSMS({
                phone: user.phone.internationalNumber,
                content: `Hey ${user.username.toUpperCase()}, you just reste your password, this is your new one: ${newPassword}`
            });
        }
    }

}