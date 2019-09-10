// import * as mongoose from 'mongoose';
// import { ObjectID } from 'bson';
// import { DAOImpl } from '../persist/dao';
// // import validator from 'validator';
// // import { ContactMode } from './shared-interfaces';
// // const debug = require('debug')('DAO');

// delete mongoose.connection.models['Catalog'];

// export interface ICatalog {
//     id?: string;
//     createdOn: Date;
//     lastUpdate: Date;
//     categories: ICategory[];
// }

// export interface ICategory {
//     name: string;
//     subCategories: ISubCategory[];
// }

// export interface ISubCategory {
//     name: string;
//     comments?: string[];
//     products: IProduct[];
// }

// //Interface for model
// export interface IProduct {
//     id?: string,
//     _id?: ObjectID,
//     designation: string,
//     description?: string,
//     duration?: Duration,
//     ratePro?: number,
//     tva?: number,
//     baseLPPTTC?: number,
//     LPPCode?: number
// }

// export type Duration = 'semaine' | 'mois' | 'prestation'; 

// // Document
// export interface CatalogDocument extends ICatalog, mongoose.Document {
//     id: string,
//     _id: ObjectID
// }

// export class CatalogDAO extends DAOImpl<ICatalog, CatalogDocument> {
//     constructor() {

//         const ProductSchema = new mongoose.Schema({
//             designation: String,
//             description: String,
//             duration: String,
//             ratePro: Number,
//             tva: Number,
//             baseLPPTTC: Number,
//             LPPCode: Number
//         }, { _id : false });

//         const SubCategorySchema = new mongoose.Schema({
//             name: String,
//             comments: [String],
//             products: [ProductSchema]
//         }, { _id : false });

//         const CategorySchema = new mongoose.Schema({
//             name: String,
//             subCategories: [SubCategorySchema]
//         }, { _id : false });

//         const CatalogSchema = new mongoose.Schema({
//             createdOn: Date,
//             lastUpdate: Date,
//             categories: [CategorySchema]
//         });
       
//         super('Catalog', CatalogSchema);
//     }
// }

/**
 * Persistence/DAO @Service for Document entity
 * @author Pierre Awaragi
 */
// import fs = require('fs');
import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import { Service } from 'typedi';
import { ObjectID } from 'bson';
import { DAOImpl } from '../persist/dao';
let mimetypes = require('mime-types');
let path = require('path');
let stream = require('stream');
var MemoryStream = require('memory-stream');

delete mongoose.connection.models['Catalog'];

export interface ICatalog {
  id?: string;
  name: string;
  file?: Buffer;
  mimeType?: string;
}

// Document
interface Catalog extends ICatalog, mongoose.Document {
    id: string,
    _id: ObjectID
}

// @Service()
// /**
//  * This class allow to store and retrieve files, no matter the size of the file.
//  */
// export class CatalogDAO {
//     CatalogModel: any = null;

//   constructor() {}

//   /**
//    * Returns mimetype of specified file
//    * @param file Multer file
//    * @returns string mimetype
//    */
//   mimetypeOf(file: any) {
//     let mimetype = file.mimeType ? file.mimetype : mimetypes.lookup(file.originalname);
//     if (!mimetype) {
//       mimetype = 'application/octet-stream';
//     }
//     return mimetype;
//   }

//   isSafeFile(filename: string): boolean {
//     let ext = path.extname(filename).toLowerCase();

//     var re = new RegExp('bmp|dib|dng|doc|docx|dwg|gif|jpg|pdf|png|ppt|pptx|rtf|tif|txt|vsd|xls|xlsx|xml');
//     let matches = ext.match(re);
//     if (matches) {
//       return true;
//     }
//     return false;
//   }

//   /**
//    * strip any extentions from specified id
//    * @param id
//    * @returns {string}
//    */
//   private stripExtension(id: string) {
//     if (id.indexOf('.') > -1) {
//       id = id.substr(0, id.lastIndexOf('.'));
//     }
//     return id;
//   }

//   /**
//    * Create a readable stream from the buffer property of tye ICatalog obj
//    *
//    * @param obj An ICatalog object
//    */
//   private makeReadStream(obj: ICatalog) {
//     // Initiate the source
//     var bufferStream = new stream.PassThrough();
//     // Write your buffer
//     bufferStream.end(obj.file);
//     return bufferStream;
//   }

//   private makeWritableStream() {
//     return new MemoryStream();
//   }

//   create(obj: ICatalog): Promise<ICatalog> {
//     return new Promise<any>((resolve, reject) => {
//       let metadata = Object.assign({}, obj);

//       let options: any = {
//         metadata: {
//           contentType: obj.mimeType
//         }
//       };

//       let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);

//       this.makeReadStream(obj)
//         .pipe(bucket.openUploadStream(obj.name, options))
//         .on('error', function(error) {
//           reject(error);
//         })
//         .on('finish', function(uploadedFileInfo) {
//           let ext = path.extname(uploadedFileInfo.filename);
//           let result = {
//             id: uploadedFileInfo._id.toString() + ext,
//             name: uploadedFileInfo.filename,
//             mimeType: obj.mimeType
//           };
//           resolve(result);
//         });
//     });
//   }

//   get(id: string): Promise<ICatalog> {
//     return new Promise<any>((resolve, reject) => {
//       let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);

//       let oid = mongoose.Types.ObjectId(this.stripExtension(id));
//       let filters = { _id: oid };

//       bucket
//         .find(filters)
//         .toArray()
//         .then((items: any[]) => {
//           if (items.length > 0) {
//             let item = items[0];
//             let memstream = this.makeWritableStream();

//             bucket
//               .openDownloadStream(oid)
//               .pipe(memstream)
//               .on('error', function(error) {
//                 reject(error);
//               })
//               .on('finish', function() {
//                 let ext = path.extname(item.filename);

//                 let result = {
//                   id: item._id.toString() + ext,
//                   mimeType: item.metadata.contentType,
//                   file: { buffer: memstream.toBuffer() },
//                   name: item.filename
//                 };
//                 resolve(result);
//               });
//           } else {
//             reject('Document not found');
//           }
//         });
//     });
//   }

//   remove(id: string): Promise<any> {
//     return new Promise<any>((resolve, reject) => {
//       let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
//       let oid = mongoose.Types.ObjectId(this.stripExtension(id));

//       bucket.delete(oid, error => {
//         if (error) reject(error);
//         resolve(true);
//       });
//     });
//   }
// }

// export default CatalogDAO;




// // Document
export interface CatalogDocument extends ICatalog, mongoose.Document {
    id: string,
    _id: ObjectID
}

export class CatalogDAO extends DAOImpl<ICatalog, CatalogDocument> {
    
    constructor() { 
        
        const CatalogSchema = new mongoose.Schema({
            name: String,
            file: Buffer,
            mimeType: String
        });
        super('Catalog', CatalogSchema);
    }
    // CatalogModel: any = null;

    mimetypeOf(file: any) {
        let mimetype = file.mimeType ? file.mimetype : mimetypes.lookup(file.originalname);
        if (!mimetype) {
        mimetype = 'application/octet-stream';
        }
        return mimetype;
    }
    
    isSafeFile(filename: string): boolean {
        let ext = path.extname(filename).toLowerCase();
    
        var re = new RegExp('bmp|dib|dng|doc|docx|dwg|gif|jpg|pdf|png|ppt|pptx|rtf|tif|txt|vsd|xls|xlsx|xml');
        let matches = ext.match(re);
        if (matches) {
        return true;
        }
        return false;
    }

    private stripExtension(id: string) {
        if (id.indexOf('.') > -1) {
        id = id.substr(0, id.lastIndexOf('.'));
        }
        return id;
    }

    private makeReadStream(obj: ICatalog) {
        // Initiate the source
        var bufferStream = new stream.PassThrough();
        // Write your buffer
        bufferStream.end(obj.file);
        return bufferStream;
    }
    
    private makeWritableStream() {
        return new MemoryStream();
    }
    
    create(obj: ICatalog): Promise<ICatalog> {
        return new Promise<any>((resolve, reject) => {
        let metadata = Object.assign({}, obj);
    
        let options: any = {
            metadata: {
            contentType: obj.mimeType
            }
        };
    
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
    
        this.makeReadStream(obj)
            .pipe(bucket.openUploadStream(obj.name, options))
            .on('error', function(error) {
            reject(error);
            })
            .on('finish', function(uploadedFileInfo) {
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
    
    get(id: string): Promise<ICatalog> {
        return new Promise<any>((resolve, reject) => {
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
    
        let oid = mongoose.Types.ObjectId(this.stripExtension(id));
        let filters = { _id: oid };
    
        bucket
            .find(filters)
            .toArray()
            .then((items: any[]) => {
            if (items.length > 0) {
                let item = items[0];
                let memstream = this.makeWritableStream();
    
                bucket
                .openDownloadStream(oid)
                .pipe(memstream)
                .on('error', function(error) {
                    reject(error);
                })
                .on('finish', function() {
                    let ext = path.extname(item.filename);
    
                    let result = {
                    id: item._id.toString() + ext,
                    mimeType: item.metadata.contentType,
                    file: { buffer: memstream.toBuffer() },
                    name: item.filename
                    };
                    resolve(result);
                });
            } else {
                reject('Document not found');
            }
            });
        });
    }
    
    remove(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
        let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        let oid = mongoose.Types.ObjectId(this.stripExtension(id));
    
        bucket.delete(oid, error => {
            if (error) reject(error);
            resolve(true);
        });
        });
    }

}