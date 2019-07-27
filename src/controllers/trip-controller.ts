const debug = require('debug')('http');
import {JsonController, Param, Body, Get, Post, Put, Delete, Req, Res, UseBefore} from "routing-controllers";
import { TripService } from "../services/trip-service";
import { ITrip, TripDAO } from "../models/trip-model";
import { Service, Inject } from "typedi";
import { Authenticate } from "../middlewares/auth-middleware";
import { UserDAO } from "../models/user-model";

@JsonController('/trips')
@Service()
export class TripController {
  @Inject() private tripService: TripService;

  constructor() { }
 
  @Get()
  @UseBefore(Authenticate)
  async getAllTrips(@Req() request) {
    let trips = await this.tripService.findTrips(request.user.id);
    debug('GET /trips => ' + JSON.stringify(trips));
    return trips;
  }

  @Get('/:id')
  @UseBefore(Authenticate)
  async getTripById(@Param('id') id: string) { 
    debug('GET /trip by id');
    let trip = await this.tripService.findById(id);
    debug('GET /trip by id => ' + JSON.stringify(trip));
    return trip;
  }

  @Post()
  @UseBefore(Authenticate)
  async addTrip(@Body() trip: ITrip, @Req() request) {
    const newTrip = await this.tripService.createTrip(trip);
    debug('POST /trip => ' + JSON.stringify(newTrip));
    return newTrip;
  }

  @Put('/:id')
  @UseBefore(Authenticate)
  async updateTrip(@Body() trip: ITrip, @Param('id') id: string) {
    const updatedTrip = await this.tripService.updateTrip(trip, id);
    debug('PUT /trip => ' + JSON.stringify(updatedTrip));
    return updatedTrip;
  }

  @Delete('/:id')
  // @UseBefore(AdminOnly)
  async deleteTrip(@Param('id') id: string) {
    debug('DELETE /trip by id');
    const response = await this.tripService.deleteTrip(id);
    debug('DELETE /trip by id => ' + JSON.stringify(response));
    return response;
  }
 
}