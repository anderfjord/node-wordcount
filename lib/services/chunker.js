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
 * Stores the channel for global use in this module
 */
var amqpChannel;

/**
 * Loads an AMQP channel
 * @param object config
 * @return Promise
 * @resolve object
 */
var loadAmqpChannel = function (config) {

    return new Promise(function (resolve, reject) {

        amqpSrvc.getChannel(config)
            .then(function (channel) {
                resolve(channel);
            })
            .catch(function (err) {
                reject(err);
            });
    });
};

/**
 * Immediatly acquire an AMQP channel
 */
loadAmqpChannel(hostConfig.amqp)
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

            var message = new Buffer(JSON.stringify({
                requestId: requestId,
                totalChunks: chunks.length,
                text: chunk
            }));

            amqpChannel.sendToQueue(hostConfig.amqp.queue, message);
        });

        resolve({
            requestId: requestId,
            textSize: request.text.length,
            chunks: chunks.length
        });
    });
};

/**
 * Formats a chunk of text
 * @param string chunk
 * @return string
 */
var formatChunk = function (chunk) {
    chunk = chunk.replace(/\s+/gm, ' '); // Collapse whitespace to a single space
    chunk = chunk.replace(/^\s+/, ''); // Trim leading whitespace
    chunk = chunk.replace(/\s+$/, ''); // Trim trailing whitespace
    chunk = chunk.toLowerCase();
    return chunk;
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
      , absoluteMaxChunkSize = hostConfig.amqp.max_message_size;

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
            linesToKeep.push(line); 
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
            chunks.push(formatChunk(currentChunk));
            currentChunk = '';
        }
    });

    // Capture any straggling text
    if (currentChunk.length > 0) {
        chunks.push(formatChunk(currentChunk));
    }

    return chunks;
};


module.exports = {

    loadAmqpChannel: loadAmqpChannel,

    queue: queue,

    getChunks: getChunks

}