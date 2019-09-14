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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
let fs = require('fs');
const catalog_model_1 = require("../models/catalog-model");
const auth_middleware_1 = require("../middlewares/auth-middleware");
let DocumentsController = class DocumentsController {
    constructor(catalogDAO) {
        this.catalogDAO = catalogDAO;
    }
    //   @UseBefore(AdminOnly)
    uploadsNewDocument(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let name = file.originalname;
                let mimetype = this.catalogDAO.mimetypeOf(file);
                let buffer = file.buffer;
                // Regarder si l'extension est valide
                if (!this.catalogDAO.isSafeFile(name)) {
                    throw new Error('file extension not accepted');
                }
                if (file.path != null) {
                    throw new Error('Unsupported mode of operation for multer - Disk');
                }
                // file.path == null // use buffer
                let document = {
                    file: buffer,
                    name: name,
                    mimeType: mimetype
                };
                return yield this.catalogDAO.create(document);
            }
            catch (err) {
                throw new routing_controllers_1.HttpError(400, err);
            }
        });
    }
    // @UseBefore(AdminOnly)
    retrievesLastCatalog(response) {
        return __awaiter(this, void 0, void 0, function* () {
            response.set({ 'Content-Type': 'application/pdf' });
            return this.catalogDAO.get().then(data => {
                return response.status(201).send(Buffer.from(data.file.buffer));
                // response.set('Content-Type', data.mimeType);
                // response.end(data.file.buffer, 'UTF-8');
                // response.charset = data.file.buffer;
                // return response.status(201).send(data);
            })
                .catch(err => {
                return response.status(400).send(err);
                // throw new HttpError(400, err);
            });
            // try {
            //   const data = await this.catalogDAO.get();
            //   response.set({'Content-Type': data.mimeType});
            //   // response.end(data.file.buffer, 'UTF-8');
            //   // response.setEncoding('utf8');
            //   // response.write(data.file.buffer);
            //   response.status(201).send(Buffer.from(data.file.buffer));
            // } catch(err) {
            //   throw new HttpError(400, err);
            // }
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
    routing_controllers_1.Get(),
    __param(0, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "retrievesLastCatalog", null);
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