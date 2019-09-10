import { Service, Inject } from "typedi";
import { HttpError } from "routing-controllers";
// import { CatalogDAO, ICatalog } from "../models/catalog-model";

@Service()
export class CatalogService {
    // @Inject() private catalogDAO: CatalogDAO;

    // constructor() { }

    // public async getById(id: string): Promise<ICatalog> {
    //     try {
    //         return await this.catalogDAO.get(id);
    //     } catch (err) {
    //         throw new HttpError(500, 'Something went wrong while getting catalog');
    //     }
    // }

    // public async createCatalog(catalog: ICatalog): Promise<ICatalog> {
    //     try {
    //         return await this.catalogDAO.create(catalog);
    //     } catch (err) {
    //         throw new HttpError(500, 'Something went wrong while creating new catalog');
    //     }
    // }

    // public async updateCatalog(catalog: ICatalog, catalogId: string): Promise<ICatalog> {
    //     try {
    //         return await this.catalogDAO.update(catalog, catalogId);
    //     } catch (err) {
    //         throw new HttpError(500, 'Something went wrong while updating new catalog');
    //     }
    // }

    // public async deleteCatalog(catalogId: string): Promise<void> {
    //     try {
    //         return await this.catalogDAO.delete(catalogId);
    //     } catch (err) {
    //         throw new HttpError(500, 'Something went wrong while deleting new catalog');
    //     }
    // }
}