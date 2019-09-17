const debug = require('debug')('http');
import {JsonController, Body, Put, Param, Patch, UseBefore, Get, Post, Delete} from "routing-controllers";
import { IUser } from "../models/user-model";
import { Service, Inject } from "typedi";
import { UserService } from "../services/user-service";
import { Authenticate, AdminOnly } from "../middlewares/auth-middleware";

@JsonController('/users')
@Service()
export class UserController {
  @Inject() private userService: UserService;
  
  constructor() { }

  @UseBefore(AdminOnly)
  @Get()
  async getAll() {
    const users = await this.userService.getAll();
    debug('POST /users/update-password => Successfully updated!');
    return users;
  }

  @UseBefore(Authenticate)
  @Put('/:id/update')
  async updateUser(@Param('id') id: string , @Body() user: IUser) {
    const updatedUser: IUser = await this.userService.updateUser(user, id);
    debug('POST /users/update => Successfully updated!');
    return updatedUser;
  }

  @UseBefore(Authenticate)
  @Patch('/:id/update-password')
  async updateUserPassord(@Param('id') id: string, @Body() passwords: { oldPassword: string, newPassword: string }) {
    await this.userService.handleChangePassword(id, passwords.oldPassword, passwords.newPassword);
    debug('PATCH /users/update-password => Successfully updated!');
    return 'Password successfully updated!';
  }

  @UseBefore(AdminOnly)
  @Post('/create')
  async createUser(@Body() user: IUser) {
    const newUser = await this.userService.generateNewUser(user);
    debug('POST /users/create => Successfully created!');
    return newUser;
  }

  @UseBefore(AdminOnly)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
    debug('DELETE /users => Successfully deleted!');
    return 'Successfully deleted!';
  }
 
}
