import { UserDAO } from '../../src/models/user-model';
import { ObjectID } from 'bson';

export const MODELS = [
    {
        name: 'User',
        DAO: new UserDAO(),
    }
];

export const MODELS_DATA = {
    User: [
        {
            _id: new ObjectID('111111111111111111111111'),
            username: "Lebron James",
            email: "lebron.james@lakers.com",
            phone: {
                countryCode: "US",
                internationalNumber: "+1 234-243-5654",
                nationalNumber: "(234) 243-5654",
                number: "+12342435654"
            },
            password: "123456"
        },
        {
            _id: new ObjectID('222222222222222222222222'),
            username: "Stephen Curry",
            email: "stephen.curry@warriors.com",
            phone: {
                countryCode: "US",
                internationalNumber: "+1 234-243-0000",
                nationalNumber: "(234) 243-0000",
                number: "+12342430000"
            },
            password: "123456"
        }
    ]
};
