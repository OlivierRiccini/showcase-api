import { ExpressMiddlewareInterface, HttpError } from "routing-controllers";
import { TripDAO, ITrip } from "../models/trip-model";
import * as jwt from 'jsonwebtoken';
import { Service, Inject } from "typedi";
import { CONSTANTS } from '../persist/constants'

@Service()
export class Authenticate implements ExpressMiddlewareInterface {
    // @Inject() private tripDAO: TripDAO;

    // private isAdmin: boolean;

    // constructor(isAdmin: boolean) {
    //     this.isAdmin = isAdmin;
    // }  
    
    use(request: any, response: any, next: (err?: any) => Promise<any>) {
        let accessToken = request.header('Authorization');  
        // console.log('///////////////////// 1 ////////////////////////////');
        // console.log(accessToken);
        try {
            if (!accessToken) {
                throw new HttpError(401, 'No authorization token provided');
            }
            if (accessToken.startsWith('Bearer ')) {
                // Remove Bearer from string
                accessToken = accessToken.slice(7, accessToken.length);
            } 
            const decoded = jwt.verify(accessToken, CONSTANTS.ACCESS_TOKEN_SECRET, null);
            // console.log('///////////////////// 2 //////////////////////////////');
            if (typeof decoded === 'undefined') {
                throw new HttpError(401, 'Authorizationt token cannot be decoded');
            };

           const user = decoded['payload'];
            // console.log('//////////////////// 3 //////////////////////////////');
           if (!user) {
                throw new HttpError(401, 'This token is not related to any user');
           };

        //    if (request.url.includes('/trips') && this.isAdmin) {
        //         const tripId: string = request.params.id;
        //         // const isTripAdmin = await this.isUserTripAdmin(user.id, tripId);
        //         if (!isTripAdmin) {
        //             throw new HttpError(401, 'Only administrator can perform this task');             
        //         };
        //     }
            // console.log('//////////////////// 4 //////////////////////////////');
            // console.log(accessToken);
            request.user = user;
            request.token = accessToken;
            next();
        } catch(err) {
            response.status(err.httpCode ? err.httpCode : 401).send(err)
        }

    }

    // private async isUserTripAdmin(userId: string, tripId: string): Promise<boolean> {
    //     try {
    //         const trip: ITrip = await this.tripDAO.get(tripId);
    //         if (!trip) {
    //             return false;
    //         }
    //         const user = trip.participants.find(user => user.userId === userId);
    //         if (!user) {
    //             return false;
    //         }
    //         if (user && user.isAdmin) {
    //             return true;
    //         }
    //         return false;
    //     } catch (err) {
    //         throw new HttpError(401, 'User not found during trip admin checking'); 
    //     }
    // }

}

// export class AdminOnly extends Authenticate implements ExpressMiddlewareInterface {
//     constructor() {
//         super(true);
//     }
// }
