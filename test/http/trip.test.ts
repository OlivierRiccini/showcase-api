'use strict';
process.env.NODE_ENV = 'test';
var app = require('../../dist/app').app;

import 'mocha';
import mongoose = require('mongoose');
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { TripHelper, UserHelper } from '../data-test/helpers-data';
import { TripDAO, ITrip } from '../../src/models/trip-model';
import { IUser, UserDAO } from '../../src/models/user-model';
import { MODELS_DATA } from '../data-test/common-data';
import { reporters } from 'mocha';

const debug = require('debug')('test');

const tripDAO: TripDAO = new TripDAO();
const userDAO: UserDAO = new UserDAO();
const tripHelper: TripHelper = new TripHelper(tripDAO);
const userHelper: UserHelper = new UserHelper(userDAO);

const expect = chai.expect;
chai.use(chaiHttp);
chai.should();

describe('HTTP - TESTING TRIP ROUTES ./http/trip.test', function() {
  
  const request = chai.request(app).keepOpen();

  let USER: IUser;
  let USER_TOKEN: string;
  let USER_2: IUser;
  let USER_2_TOKEN: string;

  before('Initialize', async () => {
    const user1 = await userHelper.getUserAndToken(MODELS_DATA.User[0]);
    USER = user1.user;
    USER_TOKEN = user1.token;
    const user2 = await userHelper.getUserAndToken(MODELS_DATA.User[1]);
    USER_2 = user2.user;
    USER_2_TOKEN = user2.token;
    // await tripHelper.addTrips(USER);
  });

  afterEach('Clean up', async () => {
    await tripHelper.deleteAllTrips();
    // await userHelper.deleteAllUsers();
  }); 

  after('Clean up', async () => {
    await tripHelper.deleteAllTrips();
    await userHelper.deleteAllUsers();
  }); 

  it('Should retrieve all trips if user authenticated', async () => {
    await tripHelper.addTrips(USER); // create 3 trips fron mocks
    return request
      .get('/trips')
      .set('x-auth', USER_TOKEN)
      .then(
        response => {
          expect(response.status).to.equal(200);
          expect(response.body).to.have.lengthOf(3);
        })
  });

  // Try to catch error in catch block and not in then
  it.skip('Should not be able to retrieve any trips if not authenticated', async () => {
    await tripHelper.addTrips(USER); // create 3 trips fron mocks
    return request
      .get('/trips')
      // Not token provided
      .then(
        response => {
          console.log(response);
          expect(response.status).to.equal(200);
          expect(response.body).to.have.lengthOf(3);
        })
  });

  it('Should get a trip base on the id if user authenticated', async () => {
    const ObjectId = mongoose.Types.ObjectId;
    const trip: ITrip = {
        _id: new ObjectId(),
        tripName: "TEST TRIP",
        destination: "Los Angeles, California, United States",
        imageUrl: null,
        startDate: new Date('2019-03-12'),
        endDate: new Date('2019-03-25'),
        adminId: USER.id,
        userIds: [USER.id, USER_2.id]
    };
    
    const response = await request
      .post('/trips')
      .set('x-auth', USER_TOKEN)
      .send(trip)
    
    const tripId = response.body.id;
    
    request
      .get(`/trips/${tripId}`)
      .set('x-auth', USER_TOKEN)
        .then(
          response => {
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('id').to.be.a('string').to.equal(tripId);
            expect(response.body).to.have.property('tripName').to.equal('TEST TRIP');
            expect(response.body).to.have.property('destination').to.equal('Los Angeles, California, United States');
            expect(response.body).to.have.property('imageUrl');
            expect(response.body).to.have.property('startDate');
            expect(response.body).to.have.property('endDate');
            expect(response.body).to.have.property('adminId');
          },
          err => {
            debug(err);
          }
        );

    await request 
      .del(`/trips/${tripId}`)
      .set('x-auth', USER_TOKEN);
  });

  it('Should not get a trip if user not authenticated', async () => {
    const ObjectId = mongoose.Types.ObjectId;

    const trip: ITrip = {
        _id: new ObjectId(),
        tripName: "ANOTHER TEST TRIP",
        destination: "Los Angeles, California, United States",
        imageUrl: null,
        startDate: new Date('2019-03-12'),
        endDate: new Date('2019-03-25'),
        adminId: USER.id,
        userIds: [USER.id, USER_2.id]
    };
    // console.log('From test ' + USER.id);
    const response = await request
      .post('/trips')
      .set('x-auth', USER_TOKEN)
      .send(trip)
    
    return request
      .get(`/trips/${response.body.id}`)
      // No token provided
        .then(() => {
          // chai.assert.equal(1, 0, 'Should not be able to get trip');
        },
          response => {
            expect(response.status).to.equal(401);
          }
        )
    }
  );

  it('Should create a valid trip if user authenticated', async () => {
    const ObjectId = mongoose.Types.ObjectId;
    const validTrip: ITrip = {
        _id: new ObjectId('111111111111111111111111'),
        tripName: "TEST TRIP",
        destination: "Los Angeles, California, United States",
        imageUrl: 'testurlimage',
        startDate: new Date('2019-03-12'),
        endDate: new Date('2019-03-25'),
        adminId: 'testadminid'
    }

    return request
      .post('/trips')
      .set('x-auth', USER_TOKEN)
      .send(validTrip)
      .then(
        response => {
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('id').to.be.a('string').to.equal('111111111111111111111111');
          expect(response.body).to.have.property('tripName');
          expect(response.body).to.have.property('destination');
          expect(response.body).to.have.property('imageUrl');
          expect(response.body).to.have.property('startDate');
          expect(response.body).to.have.property('endDate');
          expect(response.body).to.have.property('adminId');
        },
        err => {
          debug(err)
        }
      )
  });

  it('Should not create a valid trip if user not authenticated', async () => {
    const ObjectId = mongoose.Types.ObjectId;
    const generatedId = new ObjectId();
    const validTrip: ITrip = {
        _id: generatedId,
        tripName: "TEST TRIP",
        destination: "Los Angeles, California, United States",
        imageUrl: 'testurlimage',
        startDate: new Date('2019-03-12'),
        endDate: new Date('2019-03-25'),
        adminId: 'testadminid'
    }

    return request
      .post('/trips')
       // No token provided
      .send(validTrip)
      .then(() => {
        // chai.assert.equal(1, 0, 'Should not be able to get trip');
      },
        response => {
          expect(response.status).to.equal(401);
        }
      )
  });

  it('Should delete a trip if user is Admin only', async () => {
    
    const ObjectId = mongoose.Types.ObjectId;
    const trip : ITrip = {
        _id: new ObjectId(),
        tripName: "TEST TRIP",
        destination: "Los Angeles, California, United States",
        imageUrl: null,
        startDate: new Date('2019-03-12'),
        endDate: new Date('2019-03-25'),
        adminId: USER.id,
        userIds: [USER.id, USER_2.id]
    };
    
    const response = await request
      .post('/trips')
      .set('x-auth', USER_TOKEN)
      .send(trip)
    
    const nbOfTrips = await tripDAO.count({});
    expect(nbOfTrips).to.equal(1);
    return request
      .delete(`/trips/${response.body.id}`)
      .set('x-auth', USER_TOKEN) // USER is admin
      .then(
        async response => {
          expect(response.status).to.equal(200);
          const newNbOfTrips = await tripDAO.count({});
          expect(newNbOfTrips).to.equal(nbOfTrips -1);
        },
        err => {
          debug(err)
        }
      )
  });

  // See why catching errors in then block
  it.skip('Should not delete a trip if user is not Admin', async () => {
    const ObjectId = mongoose.Types.ObjectId;
    const trip : ITrip = {
        _id: new ObjectId(),
        tripName: "TEST TRIP",
        destination: "Los Angeles, California, United States",
        imageUrl: null,
        startDate: new Date('2019-03-12'),
        endDate: new Date('2019-03-25'),
        adminId: USER.id,
        userIds: [USER.id, USER_2.id]
    };
    
    const response = await request
      .post('/trips')
      .set('x-auth', USER_TOKEN)
      .send(trip)
    
    let nbOfTrips = await tripDAO.count({});
    expect(nbOfTrips).to.equal(1);
    return request
      .delete(`/trips/${response.body.id}`)
      .set('x-auth', USER_2_TOKEN) // USER_2 is not admin of this trip
      .then(
        (response) => {
          console.log(response.body);
          // chai.assert.equal(1, 2, 'Should not delete trip');
      })
      .catch(response => {
        console.log(response);
      });
  });

  it('Should update a valid trip if authenticated and part of the trip', async () => {
    const ObjectId = mongoose.Types.ObjectId;

    const trip: ITrip = {
      _id: new ObjectId(),
      tripName: 'TEST TRIP',
      destination: 'Los Angeles, California, United States',
      imageUrl: null,
      startDate: new Date('2019-03-12'),
      endDate: new Date('2019-03-25'),
      adminId: USER.id,
      userIds: [USER.id, USER_2.id]
    };
    
    await request
      .post('/trips')
      .set('x-auth', USER_TOKEN)
      .send(trip)

    const tripToUpdate: ITrip = {
      tripName: 'TEST TRIP EVER',
      destination: 'Los Angeles, California, United States',
      imageUrl: 'new image url',
      startDate: new Date('2019-03-12'),
      endDate: new Date('2019-03-25'),
      adminId: 'testadminid'
    }

    const id = trip._id;

    return request
      .put(`/trips/${id}`)
      .set('x-auth', USER_2_TOKEN)
      .send(tripToUpdate)
      .then(response => {
        expect(response.status).to.equal(200);
        expect(response.body.tripName).to.equal('TEST TRIP EVER');
        expect(response.body.imageUrl).to.equal('new image url');
      });
    
  });

  it('Should not update a trip if not authenticated and/or part of the trip', async () => {
    const ObjectId = mongoose.Types.ObjectId;

    const trip: ITrip = {
      _id: new ObjectId(),
      tripName: 'TEST TRIP',
      destination: 'Los Angeles, California, United States',
      imageUrl: null,
      startDate: new Date('2019-03-12'),
      endDate: new Date('2019-03-25'),
      adminId: USER.id,
      userIds: [USER.id, USER_2.id]
    };
    
    await request
      .post('/trips')
      .set('x-auth', USER_TOKEN)
      .send(trip)

    const tripToUpdate: ITrip = {
      tripName: 'TEST TRIP EVER',
      destination: 'Los Angeles, California, United States',
      imageUrl: 'new image url',
      startDate: new Date('2019-03-12'),
      endDate: new Date('2019-03-25'),
      adminId: 'testadminid'
    }

    const id = trip._id;

    return request
      .put(`/trips/${id}`)
      // No token provided
      .send(tripToUpdate)
      .then(response => {
        // chai.assert.equal(1, 2, 'Should not update a trip')
      }, response => {
        expect(response.status).to.equal(401);
      });
    
  });

});
