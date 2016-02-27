'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var hostConfig = require('../../../config/host.json')
  , amqpSrvc = require('../../../lib/services/amqp');


describe('AMQP Service', function() {

    before(function() {
        amqpSrvc.closeConnections();
    });

    describe('getChannel', function() {

        it('should throw an error when invalid config is passed', function (done) {
            amqpSrvc.getChannel({})
                .then(function (channel) {
                    done(new Error('amqpSrvc.getChannel should throw when invalid config supplied'));
                })
                .catch(function (err) {
                    done();
                });
        });

        it('should retrieve a channel object', function (done) {
            amqpSrvc.getChannel(hostConfig.amqp)
                .then(function (channel) {
                    channel.should.be.an.Object;
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should close any existing connections', function (done) {
            amqpSrvc.getChannel(hostConfig.amqp)
                .then(function (channel) {
                    channel.should.be.an.Object;
                    amqpSrvc.closeConnections();
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});