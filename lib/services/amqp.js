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

/**
 * AMQP Settings
 */
var AMQP_CONNECTION = null
  , AMQP_PUBLISHER = null
  , AMQP_QUEUE_NAME = 'wordcount';

var connection = null;

/**
 * 
 */
var getChannel = function (config) {

    return new Promise(function (resolve, reject) {

        if (connection) {
            return resolve(connection);
        }

        amqplib
            .connect('amqp://' + config.user + ':' + config.pass + '@' + config.host + '/')
            .then(function(conn) {

                connection = conn;
                
                var ok = connection.createChannel();

                ok = ok.then(function(ch) {

                    ch.assertQueue(config.queue);

                    var channel = {};

                    // Wrap the channel object's publish function
                    channel.sendToQueue = function (msg) {
                        console.log('AMQP PUBLISH: ', msg), 
                        ch.sendToQueue(config.queue, new Buffer(msg));
                    };

                    channel.consume = function () {
                        ch.consume(config.queue, function(msg) {
                            if (msg !== null) {
                                console.log('AMQP CONSUME: ', msg.content.toString());
                                ch.ack(msg);
                            }
                        });
                    };

                    resolve(channel);
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