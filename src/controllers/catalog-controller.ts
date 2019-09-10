import { JsonController, Post, UploadedFile, Get, Param, Res, Delete, UseBefore, HttpError, Req } from 'routing-controllers';
import { Inject, Service } from 'typedi';
// import { AuthenticatedOnly, NotInProduction, AgentOnly } from '../middlewares/authorization-middleware';
let fs = require('fs');
// const config = require('config');
// const currentVersion = config.get('application.currentVersion');
import { CatalogDAO, ICatalog } from '../models/catalog-model';
import { AdminOnly } from '../middlewares/auth-middleware';
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

@JsonController('/catalog')
@Service()
export class DocumentsController {
  constructor(private catalogDAO: CatalogDAO) {}

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
  @Post()
  uploadsNewDocument(@UploadedFile('file') file: any): Promise<ICatalog> {
    let name = file.originalname;
    let mimetype = this.catalogDAO.mimetypeOf(file);
    let filePath = file.path;
    let buffer = file.buffer;
    // Regarder si l'extension est valide
    if (!this.catalogDAO.isSafeFile(name)) {
        throw new HttpError(400, 'file extension not accepted');
    }
    if (file.path != null) {
      return new Promise((resolve, reject) => {
        reject('Unsupported mode of operation for multer - Disk');
      });
    } else {
      // file.path == null // use buffer
      let document: ICatalog = {
        file: buffer,
        name: name,
        mimeType: mimetype
      };
      return this.catalogDAO.create(document).then(saved => {
        return saved;
      });
    }
  }

  @Get('/:id')
  retrievesDocumentByItsID(@Param('id') id: string, @Res() response: any) {
    return this.catalogDAO
      .get(id)
      .then(data => {
        if (data) {
          response.append('Content-Type', data.mimeType);
          response.end(data.file.buffer, 'UTF-8');
        } else {
          response.status(404);
          // 404 handler will take care of message content
        }
      })
      .catch(error => {
        response.status(500).send(error.message);
      });
  }

  @UseBefore(AdminOnly)
  @Delete('/:id')
  deletesDocumentByItsId(@Param('id') id: string, @Res() response: any) {
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
}
