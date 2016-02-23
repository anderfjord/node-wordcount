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
  , amqplib = require('amqplib')
  , UUID = require('node-uuid');

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json')
  , httpSrvc = require('./http');

/**
 * AMQP Settings
 */
var AMQP_CONNECTION = null
  , AMQP_PUBLISHER = null
  , AMQP_QUEUE_NAME = 'wordcount';


/**
 * Chunks a body of text and passes each chunk to a message queue
 * @param object request
 * @return Promise
 * @resolve object
 */
var queue = function (request) {

    var requestId = UUID.v4();

    return new Promise(function(resolve, reject) {

        if (!request 
            || typeof request !== 'object'
            || !request.text
            || typeof request.text !== 'string'
        ) {
            return reject({
                code: httpSrvc.BAD_REQUEST
            });
        }

        var chunks = getChunks(request.text);

        chunks.forEach(function (chunk) {

            var message = {
                uuid: requestId,
                text: chunk
            };

            //  AMQP_PUBLISHER.sendToQueue(JSON.stringify(message));
        });

        resolve({
            requestId: requestId,
            chunks: chunks.length
        });
    });
};

/**
 * Chunks a body of text and returns the chunks
 * @param string text
 * @return array
 */
var getChunks = function (text) {

    var chunks = [];

    chunks.push(text);

    return chunks;
};

/**
 * Immediately establish a connection to the message queue
 */
(function () {
    new Promise(function (res, rej) {
        amqplib
            .connect('amqp://guest:guest@localhost/')
            .then(function(conn) {

                AMQP_CONNECTION = conn;
                
                var ok = AMQP_CONNECTION.createChannel();

                ok = ok.then(function(ch) {

                    ch.assertQueue(AMQP_QUEUE_NAME);

                    AMQP_PUBLISHER = {};

                    // Wrap the channel object's publish function
                    AMQP_PUBLISHER.sendToQueue = function (msg) {
                        console.log('AMQP PUBLISH: ', msg), 
                        ch.sendToQueue(AMQP_QUEUE_NAME, new Buffer(msg));
                    };

                    res();
                });

                return ok;
            })
            .catch(function (err) {
                console.error('Error establishing AMQP connection in chunker service: ', err);
                rej(err);
            });
    });
})();


module.exports = {

    queue: queue,

    getChunks: getChunks

}