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
  , UUID = require('node-uuid');

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json')
  , httpSrvc = require('./http')
  , amqpSrvc = require('./amqp');


/**
 * Immediatly acquire an AMQP channel
 */
var amqpChannel;
amqpSrvc.getChannel(hostConfig.amqp)
    .then(function (channel) {
        amqpChannel = channel;
    })
    .catch(function (err) {
        throw 'Channel not acquired in chunker service: ' + err;
    });

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

            // amqpChannel.sendToQueue(JSON.stringify(message));
        });

        resolve({
            requestId: requestId,
            textSize: request.text.length,
            chunks: chunks.length
        });
    });
};

/**
 * Chunks a body of text and returns the chunks
 * @param string text
 * @param integer maxChunkSize
 * @return array
 */
var getChunks = function (text, maxChunkSize) {

    var chunks = []
      , textLength = text.length
      , rawLines = []
      , linesToKeep = []
      , currentChunk = ''
      , currentChunkSize = 0
      , absoluteMaxChunkSize = 10000;

    if (!isNaN(maxChunkSize)) {
        maxChunkSize = parseInt(maxChunkSize, 10);

        if (maxChunkSize > absoluteMaxChunkSize) {
            maxChunkSize = absoluteMaxChunkSize;
        }
    } else {
        maxChunkSize = absoluteMaxChunkSize;
    }

    text = text.replace(/[\.,;:\?!"]/gm, ' '); // Replace certain punctuation marks with spaces
    rawLines = text.split(/[\n\r]/gm); // Split on lines

    // Extract only non-empty lines
    rawLines.forEach(function (line) {
        if (line.length > 0) {
            linesToKeep.push(line.replace(/\s{2,}/gm, ' ')); // Collapse whitespace to a single space
        }
    });

    // Compile non-empty lines into chunks
    linesToKeep.forEach(function (line) {

        // A new chunk is starting
        if (currentChunk.length < 1) {
            currentChunk += line + ' ';
        }
        // Adding to a chunk while staying under the limit
        else if ((currentChunkSize + line.length) <= maxChunkSize) {
            currentChunk += line + ' ';
        }

        // Current chunk just exceeded the limit
        if (currentChunk.length >= maxChunkSize) {
            chunks.push(currentChunk.toLowerCase());
            currentChunk = '';
        }
    });

    // Capture any straggling text
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.toLowerCase());
    }

    return chunks;
};


module.exports = {

    queue: queue,

    getChunks: getChunks

}