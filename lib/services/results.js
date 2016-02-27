'use strict';

/**
 * Results Service
 *
 * Handles storing and retrieving results related to wordcount requests
 */

/**
 * Package Dependencies
 */
var Promise = require('bluebird');

/**
 * Local Dependencies
 */
var databaseSrvc = require('./database')
  , uuidSrvc = require('./uuid');


/**
 * @param string requestId
 * @param array counts
 * @param integer totalChunksInRequest
 * @return Promise
 * @resolve
 */
var storeResults = function (requestId, counts, totalChunksInRequest) {

    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * @param object request
 * @return Promise
 * @resolve object
 */
var getResults = function (request) {

    return new Promise(function (resolve, reject) {

        if (!request.requestId) {
            return reject({
                code: httpSrvc.BAD_REQUEST,
                message: 'Request id is required'
            });
        } else if (!uuidSrvc.validate(request.requestId)) {
            return reject({
                code: httpSrvc.BAD_REQUEST,
                message: 'Invalid request id'
            });
        }

        resolve({
            requestId: request.requestId,
            counts: {}
        });
    });
};


module.exports = {

    storeResults: storeResults,

    getResults: getResults

}