import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import { ObjectID } from 'bson';
import { DAOImpl } from '../persist/dao';
let mimetypes = require('mime-types');
let path = require('path');
let stream = require('stream');
const MemoryStream = require('memory-stream');

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

// // Document
export interface CatalogDocument extends ICatalog, mongoose.Document {
    id: string,
    _id: ObjectID
}

export class CatalogDAO extends DAOImpl<ICatalog, CatalogDocument> {
    private result;
    constructor() { 
        
        const CatalogSchema = new mongoose.Schema({
            name: String,
            file: Buffer,
            mimeType: String
        });
        super('Catalog', CatalogSchema);
    }
    // CatalogModel: any = null;

    public mimetypeOf(file: any) {
        let mimetype = file.mimeType ? file.mimetype : mimetypes.lookup(file.originalname);
        if (!mimetype) {
            mimetype = 'application/octet-stream';
        }
        return mimetype;
    }
    
    public isSafeFile(filename: string): boolean {
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
    
    public create(obj: ICatalog): Promise<ICatalog> {
        return new Promise<any>((resolve, reject) => {
        // let metadata = Object.assign({}, obj);
    
        const options: any = {
            metadata: {
            contentType: obj.mimeType
            }
        };
    
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);

        // Drop DB to keep just one catalog stored in it
        bucket.drop();
    
        this.makeReadStream(obj)
            .pipe(bucket.openUploadStream(obj.name, options))
            .on('error', (error) => {
                reject(error);
            })
            .on('finish', (uploadedFileInfo) => {
            const ext = path.extname(uploadedFileInfo.filename);
            const result = {
                id: uploadedFileInfo._id.toString() + ext,
                name: uploadedFileInfo.filename,
                mimeType: obj.mimeType
            };
                resolve(result);
            });
        });
    }

    public async get(): Promise<ICatalog> {
        console.log('////////////////////////////// 1 ////////////////////////////////////');
        return new Promise<any>((resolve, reject) => {
        console.log('////////////////////////////// 2 ////////////////////////////////////');
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        bucket
            .find()
            .sort({ _id: -1 })
            .limit(1)
            .toArray()
            .then((items: any[]) => {
                console.log('////////////////////////////// 3 ////////////////////////////////////');
                if (items.length > 0) {
                    console.log('////////////////////////////// 4 ////////////////////////////////////');
                    const item = items[0];
                    const memstream = this.makeWritableStream();
                    console.log('////////////////////////////// 5 ////////////////////////////////////');
                    const oid = mongoose.Types.ObjectId(this.stripExtension(item._id.toString()));
                    console.log('////////////////////////////// 6 ////////////////////////////////////');
                    bucket
                    .openDownloadStream(oid)
                    .pipe(memstream)
                    .on('error', (error) => {
                        console.log('////////////////////////////// 7 ////////////////////////////////////');
                        reject(error);
                    })
                    .on('finish', () => {
                        console.log('////////////////////////////// 8 ////////////////////////////////////');
                        let ext = path.extname(item.filename);
        
                        let result = {
                        id: item._id.toString() + ext,
                        mimeType: item.metadata.contentType,
                        file: { buffer: memstream.toBuffer() },
                        name: item.filename
                        };
                        console.log('////////////////////////////// 9 ////////////////////////////////////');
                        resolve(result);
                    });
                    console.log('////////////////////////////// 10 ////////////////////////////////////');
                } else {
                    console.log('////////////////////////////// 11 ////////////////////////////////////');
                    reject('Not Found');
                }
            })
            .catch((error) => {
                console.log('////////////////////////////// 12 ////////////////////////////////////');
                reject(error)
            });
        });
    }
    
    public getByid(id: string): Promise<ICatalog> {
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
    
    public remove(id: string): Promise<any> {
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