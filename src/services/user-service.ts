import { Service, Inject } from "typedi";
import { IUser, UserDAO } from "../models/user-model";
import { AuthService } from "./auth-service";
import { HttpError } from "routing-controllers";
import { SecureService } from "./secure-service";
import { MailService } from "./mail-service";
import { CONSTANTS } from "../persist/constants";

@Service()
export class UserService {
    @Inject() private secureService: SecureService;
    @Inject() private userDAO: UserDAO;
    @Inject() private authService: AuthService;
    @Inject() private mailService: MailService;
    
    constructor() { }

    public async updateUser(user: IUser, userId: string): Promise<IUser> {
        try {
            await this.authService.emailValidation(user.email, userId);
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

    public async getAll(): Promise<IUser[]> {
        try {
            const users = await this.userDAO.getAll();
            if (!users) {
                throw new Error('Something went wrong while retrieving all users');
            }
            return users;
        } catch(err) {
            throw new HttpError(404, err.message);
        }
    }

    public async generateNewUser(user: IUser): Promise<IUser> {
        try {
            const generatedPassword = await this.secureService.generateNewPassword();
            user.password = generatedPassword;
            user = await this.userDAO.create(user);
            await this.mailService.send({
                to: user.email,
                subject: 'Bienvenue chez Balagne Medical Service',
                html: `
                <p>Bonjour ${user.username.toUpperCase()},
                nous venons de vous donner accès à notre site internet.</p>
                <p>Vous pouvez maintenant vous connecter à votre espace avec les
                identifiants suivants:</p>
                <span>Adresse email: </span><strong>${user.email}</strong>
                <br>
                <span>Mot de passe: </span><strong>${generatedPassword}</strong>
                <br>
                <p>Vous pouvez vous y rendre immediatement en cliquant sur lien suivant:</p>
                <a href="${CONSTANTS.BASE_SPA_URL}/pharmacies/auth">M'authentifier</a>
                <br>
                <p>Une fois connecté, vous pourrez modifier votre mot de passe et vos informations</p>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter</p>
                <p>Merci et à bientôt chez Balagne Medical Service</p>
                `
            });
            return user;
        } catch(err) {
            throw new HttpError(404, err.message);
        }
    }

    private async sendMessagesAfterRestePassword(user: IUser, newPassword: string): Promise<void> {
        if (user.email) {
            await this.mailService.send({
                to: user.email,
                subject: 'Nouveau mot de passe',
                html: `
                <p>Bonjour ${user.username.toUpperCase()},
                vous venez de changer votre mot de passe.</p>
                <span>Nouveau mot de passe: </span><strong>${newPassword}</strong>
                <br>
                <a href="${CONSTANTS.BASE_SPA_URL}/pharmacies/auth">M'authentifier</a>
                `
            });
        }
    }

}