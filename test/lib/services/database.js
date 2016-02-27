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

    describe('getDatabaseName', function() {
        it('should return a string representing a database name', function () {
            var dbName = databaseSrvc.getDatabaseName();
            dbName.should.be.a.String;
            dbName.length.should.be.greaterThan(0);
        });
    });

    describe('getConnection', function() {
        it('should return a connection object', function () {
            var dbConn= databaseSrvc.getConnection();
            dbConn.should.be.an.Object;
            dbConn.should.have.properties(['query', 'end']);
            dbConn.close();
        });
    });

    describe('exec', function() {
        it('should execute a query', function (done) {
            databaseSrvc.exec('')
                .then(function () {
                    done()
                });
        });
    });

    describe('select', function() {
        it('should perform a select query', function (done) {
            databaseSrvc.select('')
                .then(function () {
                    done()
                });
        });
    });
});