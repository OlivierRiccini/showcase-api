const debug = require('debug')('http');
import {JsonController, Body, Put, Param, UseBefore, Delete, Post} from "routing-controllers";
import { Service, Inject } from "typedi";
import { Authenticate } from "../middlewares/auth-middleware";
import { IOrganization } from "../models/organization-model";
import { OrganizationService } from "../services/organization-service";

@JsonController('/organizations')
@Service()
export class OrganizationController {
  @Inject() private organizationService: OrganizationService;
  
  constructor() { }

//   @UseBefore(Authenticate)
  @Post('/')
  async createOrganization(@Body() organization: IOrganization) {
    const newOrganization: IOrganization = await this.organizationService.createOrganization(organization);
    debug('POST /organizations => Successfully created!');
    return newOrganization;
  }

//   @UseBefore(Authenticate)
  @Put('/:id')
  async updateOrganization(@Param('id') id: string , @Body() organization: IOrganization) {
    const updatedOrganization: IOrganization = await this.organizationService.updateOrganization(organization, id);
    debug(`PUT /organizations/${id}/update => Successfully updated!`);
    return updatedOrganization;
  }

//   @UseBefore(Authenticate)
  @Delete('/:id')
  async deleteOrganization(@Param('id') id: string) {
    await this.organizationService.deleteOrganization(id);
    debug(`DEL /organizations/${id} => Successfully deleted!`);
    return 'Organization successfully deleted!';
  }
 
}
