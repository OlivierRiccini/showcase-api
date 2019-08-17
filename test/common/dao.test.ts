'use strict';
process.env.NODE_ENV = 'test';

import 'mocha';
import * as chai from 'chai';
import { MODELS, MODELS_DATA } from '../data-test/common-data';
const forEach = require('mocha-each');

const debug = require('debug')('test');

const expect = chai.expect;
chai.should();

describe('COMMON - TESTING EACH MODEL DAO - ./common/dao.test', function() {

    beforeEach('Clean up', (done) => {
        for (const MODEL of MODELS) {
            const modelDAO = MODEL.DAO;
            modelDAO.deleteAll()
                .then(() => debug('Done, DB cleaned up after tests!'))
                .catch(err => debug('Error during cleaning DB test= ' + err))
            }
        done();  
    });

    afterEach('Clean up', (done) => {
        for (const MODEL of MODELS) {
            const modelDAO = MODEL.DAO;
            modelDAO.deleteAll()
                .then(() => debug('Done, DB cleaned up after tests!'))
                .catch(err => debug('Error during cleaning DB test= ' + err))
            } 
        done();  
    }); 
    
    forEach(MODELS)
    .it('Should create a valid document', async MODEL => {
        const modelDAO = MODEL.DAO;
        return modelDAO.create(MODELS_DATA[MODEL.name][0]).then(response => {
            expect(response).to.have.property('id').to.be.a('string');
        });
    });

    forEach(MODELS)
    .it('Should get a document based on id', async MODEL => {
        const modelDAO = MODEL.DAO;
        const newInstance = await modelDAO.create(MODELS_DATA[MODEL.name][0]);
        return modelDAO.get(newInstance.id).then(response => {
            expect(response).to.have.property('id').to.be.a('string');
        });
    });

    forEach(MODELS)
    .it('Should getAll documents', async MODEL => {
        const modelDAO = MODEL.DAO;
        for (const modelData of MODELS_DATA[MODEL.name]) {
            await modelDAO.create(modelData);
        }
        
        return modelDAO.getAll().then(response => {
            expect(response).to.have.lengthOf(MODELS_DATA[MODEL.name].length);
        });
    });

    forEach(MODELS)
    .it('Should find documents', async MODEL => {
        const modelDAO = MODEL.DAO;

        for (const modelData of MODELS_DATA[MODEL.name]) {
            await modelDAO.create(modelData);
        }

        return modelDAO.find({find: {}}).then(response => {
            expect(response).to.have.lengthOf(MODELS_DATA[MODEL.name].length);
        });
    });

    forEach(MODELS)
    .it('Should update document', async MODEL => {
        const modelDAO = MODEL.DAO;

        const instance = MODELS_DATA[MODEL.name][0];
        let document = await modelDAO.create(instance);

        document.__v += 1; 
        return modelDAO.update(document).then(documentUpdated => {
            expect(documentUpdated).to.have.property('__v');
            expect(documentUpdated.__v).to.equals(1);
        });
    });

    forEach(MODELS)
    .it('Should delete a document', async MODEL => {
        const modelDAO = MODEL.DAO;

        const instance = MODELS_DATA[MODEL.name][0];
        let document = await modelDAO.create(instance);
        let nbOfDocuments = await modelDAO.count({});
        expect(nbOfDocuments).to.equals(1);
        modelDAO.delete(document.id).then(response => {
            expect(response).to.have.property('message');
            expect(response.message).to.equals('Deleted');
        });
        nbOfDocuments = await modelDAO.count({});
        expect(nbOfDocuments).to.equals(0);
    });

    forEach(MODELS)
    .it('Should delete all documents', async MODEL => {
        const modelDAO = MODEL.DAO;

        for (const modelData of MODELS_DATA[MODEL.name]) {
            await modelDAO.create(modelData);
        }

        let nbOfDocuments = await modelDAO.count({});
        expect(nbOfDocuments).to.equals(MODELS_DATA[MODEL.name].length);

        await modelDAO.deleteAll();

        nbOfDocuments = await modelDAO.count({});
        expect(nbOfDocuments).to.equals(0);
    });

    forEach(MODELS)
    .it('Should count number of documents', async MODEL => {
        const modelDAO = MODEL.DAO;

        for (const modelData of MODELS_DATA[MODEL.name]) {
            await modelDAO.create(modelData);
        }

        const nbOfDocuments = await modelDAO.count({});
        expect(nbOfDocuments).to.equals(MODELS_DATA[MODEL.name].length);
    });

});

// findAndRemove(deleteOptions: DeleteOptions): Promise<any>;
// count(findOptions: FindOptions): Promise<any>;