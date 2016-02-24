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
 * Immediatly acquire an AMQP channel
 */
var amqpChannel;
amqpSrvc.getChannel(hostConfig.amqp)
    .then(function (channel) {
        amqpChannel = channel;
    })
    .catch(function (err) {
        throw 'Channel not acquired in worker: ' + err;
    });

