import { Service, Inject } from "typedi";
import { IOrganization, OrganizationDAO } from "../models/organization-model";
import { HttpError } from "routing-controllers";

@Service()
export class OrganizationService {
    @Inject() private organizationDAO: OrganizationDAO;

    constructor() { }

    public async createOrganization(organization: IOrganization): Promise<IOrganization> {
        try {
            return await this.organizationDAO.create(organization);
        } catch (err) {
            throw new HttpError(500, 'Something went wrong while creating new organization');
        }
    }

    public async updateOrganization(organization: IOrganization, organizationId: string): Promise<IOrganization> {
        try {
            return await this.organizationDAO.update(organization, organizationId);
        } catch (err) {
            throw new HttpError(500, 'Something went wrong while updating new organization');
        }
    }

    public async deleteOrganization(organizationId: string): Promise<void> {
        try {
            return await this.organizationDAO.delete(organizationId);
        } catch (err) {
            throw new HttpError(500, 'Something went wrong while deleting new organization');
        }
    }
}