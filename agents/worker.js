'use strict';

/**
 * Chunker Service
 *
 * Handles chunking bodies of text and passing chunks to workers via a message queue
 */

/**
 * Package Dependencies
 */
var Promise = require('bluebird');

/**
 * Local Dependencies
 */
var hostConfig = require('../config/host.json')
  , httpSrvc = require('../lib/services/http')
  , amqpSrvc = require('../lib/services/amqp');


/**
 * @param string chunk
 * @return Promise
 * @resolve object
 */
var processChunk = function (chunk) {

    return new Promise(function (resolve, reject) {

        try {
            chunk = JSON.parse(chunk);
        } catch (err) {
            reject(err);
        }

        determineTopWords(chunk)
            .then(function (topWords) {

                saveResults(chunk.requestId, topWords)
                    .then(function () {
                        resolve();
                    });
            });
    });
};

/**
 * @param string chunk
 * @return Promise
 * @resolve object
 */
var determineTopWords = function (chunk) {

    return new Promise(function (resolve, reject) {

        var topThreshold
          , topWords = []
          , wordCounts = {}
          , words = chunk.text.split(' ')
          , word;

        // Keep just the top 10 if the input all fit in a single chunk
        if (parseInt(chunk.totalChunks, 10) === 1) {
            topThreshold = 10;
        }
        // Keep more if there are multiple chunks, in order to avoid disparities in counts across chunks
        else {
            topThreshold = 50;
        }

        words.forEach(function (word) {
            if (word === '' || word === ' ') {
                return;
            }
            else if (typeof wordCounts[word] === 'undefined') {
                wordCounts[word] = 1;
            }
            else {
                wordCounts[word] += 1;
            }
        });

        var counts = [];

        for (word in wordCounts) {
            counts.push({
                word: word,
                count: wordCounts[word]
            });
        }

        topWords = counts.sort(function (a, b) {
            return (a.count > b.count) ? -1 : ((a.count < b.count) ? 1 : 0);
        });

        topWords = topWords.slice(0, topThreshold);

        console.log('TOP WORDS: ', topWords);

        resolve(topWords);
    });
};

/**
 * @param string requestId
 * @param object topWords
 * @return Promise
 * @resolve
 */
var saveResults = function (requestId, topWords) {

    return new Promise(function (resolve, reject) {

        // @TODO - store results in a database
    });
};

/**
 * Immediatly acquire an AMQP channel and start consuming
 */
amqpSrvc.getChannel(hostConfig.amqp)
    .then(function (channel) {

        channel.consume(hostConfig.amqp.queue, function(msg) {
            
            if (msg !== null) {
                
                channel.ack(msg);

                processChunk(msg.content.toString())
                    .catch(function (err) {
                        console.error('Error occurred processing chunk: ', err);
                    });
            }
        });
    })
    .catch(function (err) {
        throw 'Channel not acquired in worker: ' + err;
    });