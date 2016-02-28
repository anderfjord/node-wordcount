'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var hostConfig = require('../../../config/host.json')
  , mongoDriver = require('../../../lib/drivers/mongo');


describe('MongoDB Driver', function() {

    describe('getConnection', function() {

        it('should resolve a connection using default config', function (done) {
            mongoDriver.getConnection()
                .then(function (conn) {
                    conn.should.be.an.Object;
                    mongoDriver.closeConnection(conn);
                    done();
                });
        });

        it('should resolve a connection using custom config', function (done) {
            mongoDriver.getConnection(hostConfig.db.mongo)
                .then(function (conn) {
                    conn.should.be.an.Object;
                    mongoDriver.closeConnection(conn);
                    done();
                });
        });

        it('should throw an error if an empty config is supplied', function (done) {
            mongoDriver.getConnection({})
                .then(function () {
                    done('Error should have been thrown');
                })
                .catch(function (err) {
                    done();
                });
        });
    });

    describe('closeConnection', function() {

        it('should close a connection', function (done) {
            mongoDriver.getConnection()
                .then(function (conn) {
                    conn.should.be.an.Object;
                    mongoDriver.closeConnection(conn);
                    done();
                });
        });

        it('should do nothing if no connection is passed', function (done) {
            mongoDriver.getConnection()
                .then(function (conn) {
                    conn.should.be.an.Object;
                    mongoDriver.closeConnection();
                    done();
                });
        });
    });
});