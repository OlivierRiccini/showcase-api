import { JsonController, Post, UploadedFile, Get, Param, Res, Delete, UseBefore, HttpError, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { CatalogDAO, ICatalog } from '../models/catalog-model';
import { AdminOnly } from '../middlewares/auth-middleware';
import { Response } from "express"; 

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

  // @UseBefore(AdminOnly)
  @Get()
  public async retrievesLastCatalog(@Res() response: Response) {
    response.set({'Content-Type': 'application/pdf'});
    console.log('////////////////////////////// 20 ////////////////////////////////////');
    return this.catalogDAO.get().then(data => {
      console.log(data);
      if (!data || data === undefined) {
        return response.status(400).send('Not found');
      }
      console.log('////////////////////////////// 21 ////////////////////////////////////');
      return response.status(201).send(Buffer.from(data.file.buffer));
      // response.set('Content-Type', data.mimeType);
      // response.end(data.file.buffer, 'UTF-8');
    })
    .catch(err => {
      console.log('////////////////////////////// 22 ////////////////////////////////////');
      return response.status(400).send(err);
    })
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
