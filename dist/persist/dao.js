"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const debug = require('debug')('DAO');
const _ = require("lodash");
const bson_1 = require("bson");
;
;
// mongoose.Document
// CHECK https://github.com/Eslem/TSGeneric-DAO-API/blob/master/src/persistence/impl/mongoose/GenericDAOImplMongoose.ts
class DAOImpl {
    constructor(_modelName, _modelSchema, connection) {
        this._modelName = _modelName;
        this._modelSchema = _modelSchema;
        this.connection = connection;
        if (!this.constructor['created']) {
            if (connection) {
                this.constructor['_model'] = connection.model(_modelName, _modelSchema);
            }
            else {
                this.constructor['_model'] = mongoose.model(_modelName, _modelSchema);
            }
            this.constructor['created'] = true;
        }
        this.model = this.constructor['_model'];
    }
    create(model) {
        return new Promise((resolve, reject) => {
            let document = new this.model(model);
            document._id = document._id ? document._id : new bson_1.ObjectID();
            document.save((err, res) => {
                if (err) {
                    debug('create a document - FAILED => ' + err);
                    return reject(err);
                }
                let document = res.toObject();
                debug('create a document - OK => ' + JSON.stringify(document));
                resolve(this.idNormalizator(document));
            });
        });
    }
    ;
    get(id) {
        return new Promise((resolve, reject) => {
            this.model.findOne({ _id: new bson_1.ObjectID(id) })
                .lean()
                .exec((err, document) => {
                if (err || !document) {
                    debug('get - FAILED => document with id => ${id} not found');
                    reject(new Error(`Document with id => ${id} not found`));
                }
                else {
                    debug('get - OK => ' + JSON.stringify(document));
                    resolve(this.idNormalizator(document));
                }
            });
        });
    }
    ;
    getAll() {
        return new Promise((resolve, reject) => {
            this.model.find({})
                .lean()
                .exec((err, res) => {
                if (err) {
                    debug('findById - FAILED => No documents found');
                    reject(new Error("No documents found"));
                }
                else {
                    resolve(this.idNormalizator(res));
                }
            });
        });
    }
    ;
    update(obj, id) {
        return new Promise((resolve, reject) => {
            if (!_.isObject(obj)) {
                return reject(new TypeError('DAO.update value passed is not object.'));
            }
            if (!id && !obj['id'] && !obj['_id']) {
                return reject(new TypeError('DAO.update object passed doesn\'t have _id or id.'));
            }
            const _id = id ? new bson_1.ObjectID(id) : new bson_1.ObjectID(obj['id'] ? obj['id'] : obj['_id']);
            this.model.findOne({ _id }).exec((err, found) => {
                if (err) {
                    reject(err);
                }
                ;
                if (!found) {
                    resolve(found);
                }
                ;
                let updated = _.merge(found, obj);
                updated.save((err, updated) => {
                    // console.log(updated);
                    err ? reject(err) : resolve(this.idNormalizator(updated.toObject()));
                });
            });
        });
    }
    ;
    delete(id) {
        return new Promise((resolve, reject) => {
            this.model.deleteOne({ _id: new bson_1.ObjectID(id) }, err => {
                if (err) {
                    debug('deleteTrip - FAILED => ' + JSON.stringify(err));
                    reject(err);
                }
                debug('deleteTrip - OK');
                resolve({ message: 'Deleted' });
            });
        });
    }
    ;
    deleteAll() {
        return new Promise((resolve, reject) => {
            this.model.deleteMany({}, err => {
                if (err) {
                    debug('deleteAll documents - FAILED => ' + JSON.stringify(err));
                    reject(err);
                }
                debug('deleteAll documents - OK');
                resolve({ message: 'Deleted' });
            });
        });
    }
    find(findOptions) {
        if (findOptions.find.hasOwnProperty('id')) {
            findOptions.find._id = new bson_1.ObjectID(findOptions.find.id);
            delete findOptions.find.id;
        }
        return new Promise((resolve, reject) => {
            this.model.find(findOptions.find)
                .lean()
                .exec((err, res) => {
                if (err) {
                    debug(err.message);
                    reject(new Error(err.message));
                }
                else {
                    resolve(this.idNormalizator(res));
                }
            });
        });
    }
    ;
    // findAndRemove(deleteOptions: DeleteOptions): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         this.model.deleteOne(deleteOptions, err => {
    //             if (err) {
    //                 debug('findAndRemove - FAILED => ' + JSON.stringify(err));
    //                 reject(err);
    //             }
    //             debug('findAndRemove - OK', JSON.stringify('rr'));
    //             resolve({ message: 'Deleted' });    
    //         });
    //     })
    // };
    count(findOptions) {
        return new Promise((resolve, reject) => {
            this.model.countDocuments(findOptions)
                .lean()
                .exec((err, res) => {
                if (err) {
                    debug('count - FAILED => No documents found');
                    reject(new Error("No documents found"));
                }
                else {
                    resolve(res);
                }
            });
        });
    }
    ;
    idNormalizator(data) {
        if (_.isArray(data)) {
            return _.map(data, obj => {
                obj.id = obj._id ? obj._id.toString() : obj.id;
                delete obj._id;
                return obj;
            });
        }
        data.id = data._id.toString();
        delete data._id;
        return data;
    }
}
DAOImpl.created = false;
exports.DAOImpl = DAOImpl;
//# sourceMappingURL=dao.js.map