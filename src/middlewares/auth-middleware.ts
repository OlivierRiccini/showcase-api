import { ExpressMiddlewareInterface, HttpError } from "routing-controllers";
import * as jwt from 'jsonwebtoken';
import { Service } from "typedi";
import { CONSTANTS } from '../persist/constants'

@Service()
export class Authenticate implements ExpressMiddlewareInterface {

    use(request: any, response: any, next: (err?: any) => Promise<any>) {
        let accessToken = request.header('Authorization');
        try {
            if (!accessToken) {
                throw new HttpError(401, 'No authorization token provided');
            }
            if (accessToken.startsWith('Bearer ')) {
                // Remove Bearer from string
                accessToken = accessToken.slice(7, accessToken.length);
            } 
            const decoded = jwt.verify(accessToken, CONSTANTS.ACCESS_TOKEN_SECRET, null);
            if (typeof decoded === 'undefined') {
                throw new HttpError(401, 'Authorizationt token cannot be decoded');
            };

           const user = decoded['payload'];
           if (!user) {
                throw new HttpError(401, 'This token is not related to any user');
           };

            request.user = user;
            request.token = accessToken;
            next();
        } catch(err) {
            response.status(err.httpCode ? err.httpCode : 401).send(err)
        }

    }
}
