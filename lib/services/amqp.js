'use strict';

/**
 * Chunker Service
 *
 * Handles chunking bodies of text and passing chunks to workers via a message queue
 */

/**
 * Package Dependencies
 */
var Promise = require('bluebird')
  , amqplib = require('amqplib');

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json');

/**
 * AMQP Settings
 */
var AMQP_CONNECTION = null
  , AMQP_PUBLISHER = null
  , AMQP_CONSUMER = null
  , AMQP_QUEUE = hostConfig.amqp.queue;

/**
 * 
 */
var getChannel = function (config) {

    return new Promise(function (resolve, reject) {

        if (AMQP_CONNECTION) {
            return resolve(AMQP_CONNECTION);
        }

        amqplib
            .connect('amqp://' + config.user + ':' + config.pass + '@' + config.host + '/')
            .then(function(conn) {

                AMQP_CONNECTION = conn;
                
                var ok = AMQP_CONNECTION.createChannel();

                ok = ok.then(function (ch) {

                    ch.assertQueue(config.queue);

                    resolve(ch);
                });

                return ok;
            })
            .catch(function (err) {
                console.error('Error establishing AMQP connection in chunker service: ', err);
                reject(err);
            });
    });
};


module.exports = {

    getChannel: getChannel

}