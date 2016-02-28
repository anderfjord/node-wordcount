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
    });
});