import { JsonController, Post, UploadedFile, Get, Param, Res, Delete, UseBefore, HttpError, Req } from 'routing-controllers';
import { Service } from 'typedi';
// import { AuthenticatedOnly, NotInProduction, AgentOnly } from '../middlewares/authorization-middleware';
let fs = require('fs');
import { CatalogDAO, ICatalog } from '../models/catalog-model';
import { AdminOnly } from '../middlewares/auth-middleware';
import { Request, Response } from "express"; 

@JsonController('/catalog')
@Service()
export class DocumentsController {
  constructor(private catalogDAO: CatalogDAO) {}

//   @UseBefore(AdminOnly)
  @Post()
  public async uploadsNewDocument(@UploadedFile('file') file: any): Promise<ICatalog> {
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
      let document: ICatalog = {
        file: buffer,
        name: name,
        mimeType: mimetype
      };
      return await this.catalogDAO.create(document);
    } catch (err) {
      throw new HttpError(400, err);
    }
  }

  // @UseBefore(Auth...)
  @Get()
  public async retrievesLastCatalog(@Req() request: Request, @Res() response: Response) {
    try {
      const data = await this.catalogDAO.get();
      response.set('Content-Type', data.mimeType);
      response.end(data.file.buffer, 'UTF-8');
      response.send(data);
    } catch(err) {
      throw new HttpError(400, err);
    }
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
