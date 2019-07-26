import * as mongoose from 'mongoose';
const debug = require('debug')('DAO');
import * as _ from 'lodash';
import { ObjectID } from 'bson';

export interface DAO<T> {
    create(model: T):Promise<T>;
    get(id: number|string): Promise<T|any>;
    getAll(): Promise<[T]>;
    update(model: any, id?: string): Promise<T>;
    delete(id: number|string): Promise<any>;
    deleteAll(): Promise<any>;
    find(findOptions: FindOptions): Promise<T[]>;
    // findAndRemove(deleteOptions: DeleteOptions): Promise<any>;
    count(findOptions: FindOptions): Promise<any>;
    // removeToken(id: string): Promise<T>;
}

export interface FindOptions {
    find?: any,
    offset?: any,
    limit?: any,
    sort?: any,
    select?: any
};

export interface DeleteOptions {
    find?: any,
    offset?: any,
    limit?: any,
    sort?: any,
    select?: any
};

// mongoose.Document
// CHECK https://github.com/Eslem/TSGeneric-DAO-API/blob/master/src/persistence/impl/mongoose/GenericDAOImplMongoose.ts
export abstract class DAOImpl<T, Q extends mongoose.Document> implements DAO<T> {
    static _model;
    public model;
    static created = false;

    constructor(protected _modelName: string, protected _modelSchema, private connection?: mongoose.Mongoose) {
        if (!this.constructor['created']) {
            if (connection) {
                this.constructor['_model'] = connection.model<Q>(_modelName, _modelSchema);
            } else {
                this.constructor['_model'] = mongoose.model<Q>(_modelName, _modelSchema);
            }
            this.constructor['created'] = true;
        }
        this.model = this.constructor['_model'];
    }

    create(model: T): Promise<T> {
        return new Promise((resolve, reject) => {
            let document = new this.model(model);
            document._id = document._id ? document._id : new ObjectID();
            document.save((err, res) => {
                if (err) {
                    debug('create a document - FAILED => ' + err);
                    return reject(err);
                }
                let document = res.toObject();
                debug('create a document - OK => ' + JSON.stringify(document));
                resolve(this.idNormalizator(document));
            });
        })
    };

    get(id: number  | string): Promise<T|any> {
        return new Promise((resolve, reject) => {
            this.model.findOne({ _id: new ObjectID(id) })
            .lean()
            .exec((err: any, document: any) => {
                if (err) {
                    debug('get - FAILED => document with id => ${id} not found');
                    reject(new Error(`Document with id => ${id} not found`));
                } else {
                    debug('get - OK => ' + JSON.stringify(document));
                    resolve(this.idNormalizator(document));
                }
            })
        })
    };

    getAll(): Promise<[T]> {
        return new Promise((resolve, reject) => {
            this.model.find({})
            .lean()
            .exec((err: any, res: any) => {
                if (err) {
                    debug('findById - FAILED => No documents found');
                    reject(new Error("No documents found"));
                } else {
                    resolve(this.idNormalizator(res));
                }
            })
        });
    };

    update(obj: any, id?: string): Promise<T> {
        return new Promise<T>(
            (resolve: Function, reject: Function) => {
                if (!_.isObject(obj)) {
                    return reject(new TypeError('DAO.update value passed is not object.'));
                }
                if (!id && !obj['id'] && !obj['_id']) {
                    return reject(new TypeError('DAO.update object passed doesn\'t have _id or id.'));
                }
                const _id = id ? new ObjectID(id) : new ObjectID( obj['id']? obj['id']: obj['_id']);
                this.model.findOne({_id}).exec(
                    (err, found) => {
                        if (err) { reject(err) };
                        if (!found) { resolve(found) };
                        let updated = _.merge(found, obj);
                        updated.save(
                            (err, updated) => {
                                // console.log(updated);
                                err ? reject(err) : resolve(this.idNormalizator(updated.toObject()))
                            }
                        )
                    }
                );
            }
        );
    };

    delete(id:number|string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.model.deleteOne({ _id: new ObjectID(id) }, err => {
                if (err) {
                    debug('deleteTrip - FAILED => ' + JSON.stringify(err));
                    reject(err);
                }
                debug('deleteTrip - OK');
                resolve({ message: 'Deleted' });    
            });
        })
    };

    deleteAll(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.model.deleteMany({}, err => {
                if (err) {
                    debug('deleteAll documents - FAILED => ' + JSON.stringify(err));
                    reject(err);
                }
                debug('deleteAll documents - OK');
                resolve({ message: 'Deleted' }); 
            });
        })
    }

    find(findOptions: FindOptions): Promise<T[]> {
        if (findOptions.find.hasOwnProperty('id')) {
            findOptions.find._id = new ObjectID(findOptions.find.id);
            delete findOptions.find.id;
        }
        return new Promise((resolve, reject) => {
            this.model.find(findOptions.find)
            .lean()
            .exec((err: any, res: any) => {
                if (err) {
                    debug(err.message);
                    reject(new Error(err.message));
                } else {
                    resolve(this.idNormalizator(res));
                }
            })
        });
    };

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

    count(findOptions: FindOptions): Promise<number> {
        return new Promise((resolve, reject) => {
            this.model.countDocuments(findOptions)
            .lean()
            .exec((err: any, res: any) => {
                if (err) {
                    debug('count - FAILED => No documents found');
                    reject(new Error("No documents found"));
                } else {
                    resolve(res);
                }
            })
        });
    };

    private idNormalizator(data: any) {
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