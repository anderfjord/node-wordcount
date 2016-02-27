'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var hostConfig = require('../../../config/host.json')
  , databaseSrvc = require('../../../lib/services/database');


describe('Database Service', function() {

    describe('load MongoDB', function() {
        it('should return a MongoDB driver object', function () {
            var dbDriver = databaseSrvc.load('mongo');
            dbDriver.should.be.an.Object;
            dbDriver.should.have.properties(['getConnection', 'closeConnection']);
        });
    });

    describe('load MySQL', function() {
        it('should return a MySQL driver object', function () {
            var dbDriver = databaseSrvc.load('mysql');
            dbDriver.should.be.an.Object;
            dbDriver.should.have.properties(['getConnection', 'closeConnection', 'select', 'exec']);
        });
    });
});