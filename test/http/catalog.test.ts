// // 'use strict';
// // var app = require('../../dist/app').app;

// // import 'mocha';
// // import * as chai from 'chai';
// // import chaiHttp = require('chai-http');
// // import * as chaiAsPromised from 'chai-as-promised';
// // import { IUser, UserDAO, IUserCredentials } from '../../src/models/user-model';
// // import * as helpers from '../data-test/helpers-data';
// // // import { SecureService } from '../../src/services/secure-service';
// // // import { assert } from 'chai';
// // // import { OrganizationDAO } from '../../src/models/organization-model';
// // import { MODELS_DATA } from '../data-test/common-data';
// // import { ICatalog, ICategory, ISubCategory, IProduct } from '../../src/models/catalog-model';

// // const generalHelper: helpers.GeneralHelper = new helpers.GeneralHelper();

// // const userDAO: UserDAO = new UserDAO();
// // const userHelper: helpers.UserHelper = new helpers.UserHelper(userDAO);
// // // const secureService: SecureService = new SecureService();

// // // const organizationDAO: OrganizationDAO = new OrganizationDAO();
// // // const organizationHelper: helpers.organizationHelper = new helpers.organizationHelper(organizationDAO);

// // const expect = chai.expect;
// // chai.use(chaiHttp);
// // chai.use(chaiAsPromised)
// // chai.should();

// // describe.only('HTTP - TESTING CATALOG ROUTES ./http/catalog.test', function() {

// //   const request = chai.request(app).keepOpen();

// //   let NON_ADMIN_USER;
// //   let CATALOG: ICatalog;
// //   let ADMIN_USER;

// //   before('Create catalog', async () => {
// //     generalHelper.cleanDB();
// //     NON_ADMIN_USER = await userHelper.getUserAndToken();
// //     ADMIN_USER = await userHelper.getAdminUserAndToken();
    
// //     const response = await request
// //       .post('/catalog')
// //       .set('Authorization', ADMIN_USER.token)
// //       .send(MODELS_DATA.Catalog[0]);

// //     CATALOG = response.body;
// //   });

// //   after('Cleaning DB', async () => {
// //     generalHelper.cleanDB();
// //     // app.close();
// //   });

// //   it('POSITIVE - Should get catalog if user is auth', async () => {
// //     const response = await request
// //       .get('/catalog/' + CATALOG.id)
// //       .set('Authorization', NON_ADMIN_USER.token);
    
// //     expect(response.status).to.equal(200);
// //     expect(response.body).to.have.property('id');
// //     expect(response.body).to.have.property('createdOn');
// //     expect(response.body).to.have.property('lastUpdate');
// //     expect(response.body).to.have.property('categories');
// //   });

// //   it('NEGATIVE - Should not get catalog if user is not auth', async () => {
// //     const response = await request
// //       .get('/catalog/' + CATALOG.id)
// //       // .set('Authorization', AUTH_USER.token) // NO TOKEN PROVIDED

// //     expect(response.status).to.equal(401);
// //     expect(response.body.message).to.equals('No authorization token provided');
// //   });

// //   it('POSITIVE - Should add category to catalog if user is admin', async () => {
// //     const originNbOfCategories = CATALOG.categories.length;
// //     const newCategory: ICategory = {
// //       name: 'New category',
// //       subCategories: [{
// //         name: 'Lit et accessoires',
// //         products: [
// //           {
// //               designation: 'New category Product',
// //               description: 'New category blabla',
// //               duration: 'semaine',
// //               ratePro: 17,
// //               tva: 20,
// //               baseLPPTTC: 25,
// //               LPPCode: 1283879
// //           }
// //         ]
// //       }]
// //     };

// //     CATALOG.categories.push(newCategory);
// //     const response = await request
// //       .put('/catalog/' + CATALOG.id)
// //       .set('Authorization', ADMIN_USER.token)
// //       .send(CATALOG);
    
// //     const response2 = await request
// //       .get('/catalog/' + CATALOG.id)
// //       .set('Authorization', ADMIN_USER.token);
    
// //     CATALOG = response2.body;

// //     expect(response.status).to.equal(200);
// //     expect(CATALOG.categories.length).to.equal(originNbOfCategories + 1);
// //   });

// //   it('NEGATIVE - Should not add category to catalog if user is not admin', async () => {
// //     const originNbOfCategories = CATALOG.categories.length;
// //     const newCategory: ICategory = {
// //       name: 'New category',
// //       subCategories: [{
// //         name: 'Lit et accessoires',
// //         products: [
// //           {
// //               designation: 'New category Product',
// //               description: 'New category blabla',
// //               duration: 'semaine',
// //               ratePro: 17,
// //               tva: 20,
// //               baseLPPTTC: 25,
// //               LPPCode: 1283879
// //           }
// //         ]
// //       }]
// //     };

// //     CATALOG.categories.push(newCategory);
// //     const response = await request
// //       .put('/catalog/' + CATALOG.id)
// //       .set('Authorization', NON_ADMIN_USER.token)
// //       .send(CATALOG);

// //     const response2 = await request
// //       .get('/catalog/' + CATALOG.id)
// //       .set('Authorization', NON_ADMIN_USER.token);
    
// //     CATALOG = response2.body;

// //     expect(response.status).to.equal(401);
// //     expect(response.body.message).to.equals('Only admin can perform this action');
// //     expect(CATALOG.categories.length).to.equal(originNbOfCategories);
// //   });

// //   it('POSITIVE - Should add sub-category to catalog if user is admin', async () => {
// //     const originNbOfSubCategories = CATALOG.categories[0].subCategories.length;
// //     const newSubCategory: ISubCategory = {
// //       name: 'Lit et accessoires',
// //       products: [
// //         {
// //             designation: 'New category Product',
// //             description: 'New category blabla',
// //             duration: 'semaine',
// //             ratePro: 17,
// //             tva: 20,
// //             baseLPPTTC: 25,
// //             LPPCode: 1283879
// //         }
// //       ]
// //     };

// //     CATALOG.categories[0].subCategories.push(newSubCategory);

// //     const response = await request
// //       .put('/catalog/' + CATALOG.id)
// //       .set('Authorization', ADMIN_USER.token)
// //       .send(CATALOG);
    
// //     const response2 = await request
// //       .get('/catalog/' + CATALOG.id)
// //       .set('Authorization', ADMIN_USER.token);
    
// //     CATALOG = response2.body;

// //     expect(response.status).to.equal(200);
// //     expect(CATALOG.categories[0].subCategories.length).to.equal(originNbOfSubCategories + 1);
// //   });

// //   it('NEGATIVE - Should not add sub-category to catalog if user is not admin', async () => {
// //     const originNbOfSubCategories = CATALOG.categories[0].subCategories.length;
// //     const newSubCategory: ISubCategory = {
// //       name: 'Lit et accessoires',
// //       products: [
// //         {
// //             designation: 'New category Product',
// //             description: 'New category blabla',
// //             duration: 'semaine',
// //             ratePro: 17,
// //             tva: 20,
// //             baseLPPTTC: 25,
// //             LPPCode: 1283879
// //         }
// //       ]
// //     };

// //     CATALOG.categories[0].subCategories.push(newSubCategory);

// //     const response = await request
// //       .put('/catalog/' + CATALOG.id)
// //       .set('Authorization', NON_ADMIN_USER.token)
// //       .send(CATALOG);
    
// //     const response2 = await request
// //       .get('/catalog/' + CATALOG.id)
// //       .set('Authorization', NON_ADMIN_USER.token);
    
// //     CATALOG = response2.body;

// //     expect(response.status).to.equal(401);
// //     expect(response.body.message).to.equals('Only admin can perform this action');
// //     expect(CATALOG.categories[0].subCategories.length).to.equal(originNbOfSubCategories);
// //   });

// //   it('POSITIVE - Should update product if user is admin', async () => {
// //     const product: IProduct = CATALOG.categories[0].subCategories[0].products[0];

// //     product.LPPCode = 11111;

// //     const response = await request
// //       .put('/catalog/' + CATALOG.id)
// //       .set('Authorization', ADMIN_USER.token)
// //       .send(CATALOG);
    
// //     const response2 = await request
// //       .get('/catalog/' + CATALOG.id)
// //       .set('Authorization', ADMIN_USER.token);
    
// //     CATALOG = response2.body;
// //     const updatedProduct = CATALOG.categories[0].subCategories[0].products[0];
// //     expect(response.status).to.equal(200);
// //     expect(updatedProduct.LPPCode).to.equal(11111);
// //   });

// //   // it('POSITIVE - Should add product to catalog if user is admin', async () => {
// //   // });

// //   it('NEGATIVE - Should not update product if user is not admin', async () => {
// //     const product: IProduct = CATALOG.categories[0].subCategories[0].products[0];
// //     const originLPPCode = product.LPPCode;

// //     product.LPPCode = 11111;

// //     const response = await request
// //       .put('/catalog/' + CATALOG.id)
// //       .set('Authorization', NON_ADMIN_USER.token)
// //       .send(CATALOG);
    
// //     const response2 = await request
// //       .get('/catalog/' + CATALOG.id)
// //       .set('Authorization', NON_ADMIN_USER.token);
    
// //     CATALOG = response2.body;
// //     const nonUpdatedProduct = CATALOG.categories[0].subCategories[0].products[0];

// //     expect(response.status).to.equal(401);
// //     expect(nonUpdatedProduct.LPPCode).to.equal(originLPPCode);
// //   });

// //   // ////

// //   // it('POSITIVE - Should update category to catalog if user is admin', async () => {
// //   // });

// //   // it('NEGATIVE - Should not update category to catalog if user is not admin', async () => {
// //   // });

// //   // it('POSITIVE - Should update sub-category to catalog if user is admin', async () => {
// //   // });

// //   // it('NEGATIVE - Should not update sub-category to catalog if user is not admin', async () => {
// //   // });

// //   // it('POSITIVE - Should update product to catalog if user is admin', async () => {
// //   // });

// //   // it('NEGATIVE - Should not update product to catalog if user is not admin', async () => {
// //   // });

// //   // ////

// //   // it('POSITIVE - Should delete category to catalog if user is admin', async () => {
// //   // });

// //   // it('NEGATIVE - Should not delete category to catalog if user is not admin', async () => {
// //   // });

// //   // it('POSITIVE - Should delete sub-category to catalog if user is admin', async () => {
// //   // });

// //   // it('NEGATIVE - Should not delete sub-category to catalog if user is not admin', async () => {
// //   // });

// //   // it('POSITIVE - Should delete product to catalog if user is admin', async () => {
// //   // });

// //   // it('NEGATIVE - Should not delete product to catalog if user is not admin', async () => {
// //   // });


// // });

// 'use strict';
// var app = require('../../dist/app').app;
// import 'mocha';
// import * as helpers from '../data-test/helpers-data';
// let path = require('path');
// // let fs = require('fs');
// import * as chaiAsPromised from 'chai-as-promised';
// import chai = require('chai');
// import chaiHttp = require('chai-http');
// import { UserDAO } from '../../src/models/user-model';
// chai.use(chaiHttp);
// chai.should();

// // import 'mocha';
// // import * as chai from 'chai';
// // import chaiHttp = require('chai-http');
// // import * as chaiAsPromised from 'chai-as-promised';
// // import { IUser, UserDAO, IUserCredentials } from '../../src/models/user-model';
// // import * as helpers from '../data-test/helpers-data';
// // // import { SecureService } from '../../src/services/secure-service';
// // // import { assert } from 'chai';
// // // import { OrganizationDAO } from '../../src/models/organization-model';
// // import { MODELS_DATA } from '../data-test/common-data';
// // import { ICatalog, ICategory, ISubCategory, IProduct } from '../../src/models/catalog-model';

// const generalHelper: helpers.GeneralHelper = new helpers.GeneralHelper();
// const userDAO: UserDAO = new UserDAO();
// const userHelper: helpers.UserHelper = new helpers.UserHelper(userDAO);

// describe.only("E2E /documents API", () => {
//     const request = chai.request(app).keepOpen();
    
//     let smallFilename = path.basename(__filename) + ".pdf";
//     let largeFilename = 'large_file.pdf';

//     let ext = path.extname(smallFilename);

//     const mongoMaxLength = 16777216; // 16 777 216 ~ 16 MB
//     let largeBuffer = Buffer.alloc(mongoMaxLength + 100, "bonjour.");

//     let NON_ADMIN_USER;
//     let ADMIN_USER;
    
//     before('Create catalog', async () => {
//         generalHelper.cleanDB();
//         NON_ADMIN_USER = await userHelper.getUserAndToken();
//         ADMIN_USER = await userHelper.getAdminUserAndToken();
//     });

//     after('Cleaning DB', async () => {
//         generalHelper.cleanDB();
//         // app.close();
//     });

//     it("C54 C56 C60 Positive POST /documents as admin", async () => {

//         let response = await request
//             .post('/catalog')
//             .set('Authorization', ADMIN_USER)
//             .attach("file", __filename, smallFilename);

//         console.log(response.body);

//         response.should.be.ok;
//         response.should.be.json;
//         response.body.should.have.property('id');
//         response.body.should.have.property('name');
//         response.body.name.should.be.equals(smallFilename);

//         const id = response.body.id;
//         path.extname(id).should.be.equals(ext);

//         response = await request
//             .get('/documents/' + id);
//         response.should.be.ok;

//         response = await request
//             .del('/documents' + id)
//             .set('Authorization', ADMIN_USER)

//         response.should.be.ok;
//         response.status.should.be.equal(204);
//         return response;
//     });

//     it('C57 Negative POST /documents as anonymous', async () => {
//         try {
//             await request
//                 .post('/catalog/')
//                 .attach("file", __filename, smallFilename)
//         }
//         catch (error) {
//             const response = error.response
//             response.status.should.be.equals(401);
//         }
//     });

//     it('C57 Negative POST /documents if no admin', async () => {
//         try {
//             await request
//                 .post('/catalog/')
//                 .set('Authorization', NON_ADMIN_USER)
//                 .attach("file", __filename, smallFilename)
//         }
//         catch (error) {
//             const response = error.response
//             response.status.should.be.equals(401);
//         }
//     });

//     it('C55 should upload large document', async function () {
//         // large file to upload, give it more time

//         let response = await request
//             .post("/catalog/")
//             .set('Authorization', ADMIN_USER)
//             .attach("file", largeBuffer, largeFilename)

//         response.should.be.ok;
//         response.should.be.json;
//         response.body.should.have.property('id');
//         response.body.should.have.property('name');
//         response.body.name.should.be.equals(largeFilename);

//         const id = response.body.id;
//         path.extname(id).should.be.equals(path.extname(largeFilename));
//         response = await request.get("/documents/" + id)

//         response.should.be.ok;
//         response = await request
//             .del("/documents/" + id)
//             .set('Authorization', ADMIN_USER)

//         response.should.be.ok;
//         response.status.should.be.equal(204);
//     });

//     it.skip("C61 +Positive - Effacer un document non-existant", async () => {
//         const id = '000000000000';
//         try {
       
//             const response = await request
//                 .del("/catalog/" + id)
//                 .set('Authorization', ADMIN_USER)
//             response.should.not.be.ok;
//         } catch (error) {
//             error.status.should.be.equals(500);
//         }
//     });
// });
