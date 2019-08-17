import { UserDAO } from '../../src/models/user-model';
import { OrganizationDAO } from '../../src/models/organization-model';
import { ObjectID } from 'bson';

export const MODELS = [
    {
        name: 'User',
        DAO: new UserDAO(),
    },
    {
        name: 'Organization',
        DAO: new OrganizationDAO(),
    }
];

export const MODELS_DATA = {
    Organization: [
        {
            _id: new ObjectID('333333333333333333333333'),
            name: 'Mega Company',
            email: 'info@megacompany.com',
            phones: [{
                countryCode: "US",
                internationalNumber: "+1 234-243-3434",
                nationalNumber: "(234) 243-3434",
                number: "+12342433434"
            }],
            address: '123 Main Street',
            description: 'Mega company de la mort qui tue'
        }
    ],
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
            organizationId: '333333333333333333333333',
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
            organizationId: '333333333333333333333333',
            password: "123456"
        }
    ]
};
