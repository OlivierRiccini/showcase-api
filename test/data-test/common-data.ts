import { UserDAO } from '../../src/models/user-model';
import { OrganizationDAO } from '../../src/models/organization-model';
import { ObjectID } from 'bson';
import { CatalogDAO, ICatalog } from '../../src/models/catalog-model';

export const MODELS = [
    {
        name: 'User',
        DAO: new UserDAO(),
    },
    {
        name: 'Organization',
        DAO: new OrganizationDAO(),
    },
    {
        name: 'Catalog',
        DAO: new CatalogDAO(),
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
    ],
    // Catalog: [
    //     {
    //         createdOn: new Date(),
    //         lastUpdate: new Date(),
    //         categories: [
    //             {
    //                 name: 'Equipement du domicile',
    //                 subCategories: [
    //                     {
    //                         name: 'Lit et accessoires',
    //                         comments: [
    //                             'Lit médical', 
    //                             `La prise en charge est assurée pour les patients ayant
    //                             perdu leur autonomie motrice.
    //                             Cette perte d&#39;autonomie peut-être transitoire ou
    //                             définitive.`
    //                         ],
    //                         products: [
    //                             {
    //                                 designation: 'Forfait location lit + potence+ Barrières',
    //                                 description: `Lit médical standard ou ultra bas (hauteur 19 cm - pour patient Alzheimer)`,
    //                                 duration: 'semaine',
    //                                 ratePro: 9.13,
    //                                 tva: 20,
    //                                 baseLPPTTC: 12.6,
    //                                 LPPCode: 1241763
    //                             },
    //                             {
    //                                 designation: 'Forfait location lit+potence+barrières',
    //                                 description: 'Lit médical pour enfant de 3à 12 ans',
    //                                 duration: 'semaine',
    //                                 ratePro: 17,
    //                                 tva: 20,
    //                                 baseLPPTTC: 25,
    //                                 LPPCode: 1283879
    //                             }
    //                         ]
    //                     }
    //                 ]
    //             }
    //         ]
    //     }
    // ]
};
