"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
// import { AuthenticatedOnly, NotInProduction, AgentOnly } from '../middlewares/authorization-middleware';
let fs = require('fs');
// const config = require('config');
// const currentVersion = config.get('application.currentVersion');
const catalog_model_1 = require("../models/catalog-model");
const auth_middleware_1 = require("../middlewares/auth-middleware");
// import * as multer from 'multer';
/**
 * Controller for documents
 */
// let conn = mongoose.connection;
// let multer = require('multer');
// let GridFsStorage = require('multer-gridfs-storage');
// let Grid = require('gridfs-stream');
// Grid.mongo = mongoose.mongo;
// let gfs = Grid(conn.db);
//  // Setting up the storage element
// let storage = GridFsStorage({
//   gfs : gfs,
// filename: (req, file, cb) => {
//     let date = Date.now();
//     // The way you want to store your file in database
//     cb(null, file.fieldname + '-' + date + '.'); 
// },
// // Additional Meta-data that you want to store
// metadata: function(req, file, cb) {
//     cb(null, { originalname: file.originalname });
// },
// root: 'ctFiles' // Root collection name
// });
// Multer configuration for single file uploads
// let upload = multer({
//   storage: storage
// }).single('file');
let DocumentsController = class DocumentsController {
    constructor(catalogDAO) {
        this.catalogDAO = catalogDAO;
    }
    // @Post()
    // upload(@Req() req, @Res() res) {
    //   console.log(req);
    //   // upload(req,res, (err) => {
    //   //   if(err){
    //   //        res.json({error_code:1,err_desc:err});
    //   //        return;
    //   //   }
    //   //   res.json({error_code:0, error_desc: null, file_uploaded: true});
    //   // });
    //   // // if(err){
    //   // //      res.json({error_code:1,err_desc:err});
    //   // //      return;
    //   // // }
    //   // res.json({error_code:0, error_desc: null, file_uploaded: true});
    // };
    //   @UseBefore(AdminOnly)
    uploadsNewDocument(file) {
        let name = file.originalname;
        let mimetype = this.catalogDAO.mimetypeOf(file);
        let filePath = file.path;
        let buffer = file.buffer;
        // Regarder si l'extension est valide
        if (!this.catalogDAO.isSafeFile(name)) {
            throw new routing_controllers_1.HttpError(400, 'file extension not accepted');
        }
        if (file.path != null) {
            return new Promise((resolve, reject) => {
                reject('Unsupported mode of operation for multer - Disk');
            });
        }
        else {
            // file.path == null // use buffer
            let document = {
                file: buffer,
                name: name,
                mimeType: mimetype
            };
            return this.catalogDAO.create(document).then(saved => {
                return saved;
            });
        }
    }
    retrievesDocumentByItsID(id, response) {
        return this.catalogDAO
            .get(id)
            .then(data => {
            if (data) {
                response.append('Content-Type', data.mimeType);
                response.end(data.file.buffer, 'UTF-8');
            }
            else {
                response.status(404);
                // 404 handler will take care of message content
            }
        })
            .catch(error => {
            response.status(500).send(error.message);
        });
    }
    deletesDocumentByItsId(id, response) {
        return this.catalogDAO
            .remove(id)
            .then(() => {
            response.status(204);
        })
            .catch(error => {
            // TODO let global error handler take care of this
            response.status(500).send(error.message);
            // return Status.failure(error.message);
        });
    }
};
__decorate([
    routing_controllers_1.Post(),
    __param(0, routing_controllers_1.UploadedFile('file')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadsNewDocument", null);
__decorate([
    routing_controllers_1.Get('/:id'),
    __param(0, routing_controllers_1.Param('id')), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "retrievesDocumentByItsID", null);
__decorate([
    routing_controllers_1.UseBefore(auth_middleware_1.AdminOnly),
    routing_controllers_1.Delete('/:id'),
    __param(0, routing_controllers_1.Param('id')), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "deletesDocumentByItsId", null);
DocumentsController = __decorate([
    routing_controllers_1.JsonController('/catalog'),
    typedi_1.Service(),
    __metadata("design:paramtypes", [catalog_model_1.CatalogDAO])
], DocumentsController);
exports.DocumentsController = DocumentsController;
//# sourceMappingURL=catalog-controller.js.map