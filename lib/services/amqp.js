'use strict';

/**
 * AMQP Service
 *
 * Manages the handling of AMQP connections and channels
 */

/**
 * Package Dependencies
 */
var Promise = require('bluebird')
  , amqplib = require('amqplib');

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json')
  , hashSrvc = require('./hash');

/**
 * Stores a connection singleton
 */
var AMQP_CONNECTIONS = {};

/**
 * Clears out the connections object
 */
var closeConnections = function () {
    for (var configHash in AMQP_CONNECTIONS) {
        delete AMQP_CONNECTIONS[configHash];
    }
};

/**
 * @param object config
 * @return Promise
 * @resolve object
 */
var getChannel = function (config) {

    return new Promise(function (resolve, reject) {

        var configHash = hashSrvc.generate('sha1', JSON.stringify(config));

        if (AMQP_CONNECTIONS[configHash]) {
            return resolve(AMQP_CONNECTIONS[configHash]);
        }

        amqplib
            .connect('amqp://' + config.user + ':' + config.pass + '@' + config.host + '/')
            .then(function(conn) {

                AMQP_CONNECTIONS[configHash] = conn;
                
                var ok = AMQP_CONNECTIONS[configHash].createChannel();

                ok = ok.then(function (ch) {

                    ch.assertQueue(config.queue);

                    resolve(ch);
                });

                return ok;
            })
            .catch(function (err) {
                reject(err);
            });
    });
};


/**
 * PUBLIC API
 */
module.exports = {

    getChannel: getChannel,

    closeConnections: closeConnections

}