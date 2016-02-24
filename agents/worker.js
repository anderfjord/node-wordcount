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

        var topThreshold = 10
          , topWords = {}
          , wordCounts = {}
          , words = chunk.text.split(' ')
          , word
          , topWord
          , currentTopWordsCount;

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

        // console.log('WORD COUNTS: ', wordCounts);

        // @TODO - something is not working properly in this block
        // some words that have higher counts than others are being discarded
        for (word in wordCounts) {

            currentTopWordsCount = Object.keys(topWords).length;

            if (currentTopWordsCount < topThreshold) {
                topWords[word] = wordCounts[word];
            }
            else {
                for (topWord in topWords) {

                    if (wordCounts[word] >= topWords[topWord]) {
                        delete topWords[topWord];
                        topWords[word] = wordCounts[word];
                    }
                }
            }
        }

        // console.log('TOP ' + topThreshold + ' WORDS: ', topWords);

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