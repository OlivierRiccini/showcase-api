"use strict";
// import * as mongoose from 'mongoose';
// import { ObjectID } from 'bson';
// import { DAOImpl } from '../persist/dao';
// // import validator from 'validator';
// // import { ContactMode } from './shared-interfaces';
// // const debug = require('debug')('DAO');
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const dao_1 = require("../persist/dao");
let mimetypes = require('mime-types');
let path = require('path');
let stream = require('stream');
var MemoryStream = require('memory-stream');
delete mongoose.connection.models['Catalog'];
class CatalogDAO extends dao_1.DAOImpl {
    constructor() {
        const CatalogSchema = new mongoose.Schema({
            name: String,
            file: Buffer,
            mimeType: String
        });
        super('Catalog', CatalogSchema);
    }
    // CatalogModel: any = null;
    mimetypeOf(file) {
        let mimetype = file.mimeType ? file.mimetype : mimetypes.lookup(file.originalname);
        if (!mimetype) {
            mimetype = 'application/octet-stream';
        }
        return mimetype;
    }
    isSafeFile(filename) {
        let ext = path.extname(filename).toLowerCase();
        var re = new RegExp('bmp|dib|dng|doc|docx|dwg|gif|jpg|pdf|png|ppt|pptx|rtf|tif|txt|vsd|xls|xlsx|xml');
        let matches = ext.match(re);
        if (matches) {
            return true;
        }
        return false;
    }
    stripExtension(id) {
        if (id.indexOf('.') > -1) {
            id = id.substr(0, id.lastIndexOf('.'));
        }
        return id;
    }
    makeReadStream(obj) {
        // Initiate the source
        var bufferStream = new stream.PassThrough();
        // Write your buffer
        bufferStream.end(obj.file);
        return bufferStream;
    }
    makeWritableStream() {
        return new MemoryStream();
    }
    create(obj) {
        return new Promise((resolve, reject) => {
            let metadata = Object.assign({}, obj);
            let options = {
                metadata: {
                    contentType: obj.mimeType
                }
            };
            let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
            this.makeReadStream(obj)
                .pipe(bucket.openUploadStream(obj.name, options))
                .on('error', function (error) {
                reject(error);
            })
                .on('finish', function (uploadedFileInfo) {
                let ext = path.extname(uploadedFileInfo.filename);
                let result = {
                    id: uploadedFileInfo._id.toString() + ext,
                    name: uploadedFileInfo.filename,
                    mimeType: obj.mimeType
                };
                resolve(result);
            });
        });
    }
    get(id) {
        return new Promise((resolve, reject) => {
            let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
            let oid = mongoose.Types.ObjectId(this.stripExtension(id));
            let filters = { _id: oid };
            bucket
                .find(filters)
                .toArray()
                .then((items) => {
                if (items.length > 0) {
                    let item = items[0];
                    let memstream = this.makeWritableStream();
                    bucket
                        .openDownloadStream(oid)
                        .pipe(memstream)
                        .on('error', function (error) {
                        reject(error);
                    })
                        .on('finish', function () {
                        let ext = path.extname(item.filename);
                        let result = {
                            id: item._id.toString() + ext,
                            mimeType: item.metadata.contentType,
                            file: { buffer: memstream.toBuffer() },
                            name: item.filename
                        };
                        resolve(result);
                    });
                }
                else {
                    reject('Document not found');
                }
            });
        });
    }
    remove(id) {
        return new Promise((resolve, reject) => {
            let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
            let oid = mongoose.Types.ObjectId(this.stripExtension(id));
            bucket.delete(oid, error => {
                if (error)
                    reject(error);
                resolve(true);
            });
        });
    }
}
exports.CatalogDAO = CatalogDAO;
//# sourceMappingURL=catalog-model.js.map