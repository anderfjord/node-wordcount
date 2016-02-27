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
var uuidSrvc = require('./uuid')
  , httpSrvc = require('./http')
  , databaseSrvc = require('./database').load('mongo');


/**
 * Use the same connection pool across the life of the process
 */
var dbConn = null;

/**
 * @param object conn
 */
var setDbConn = function (conn) {
    dbConn = conn;
};

/**
 * @return object
 */
var getDbConn = function () {
    if (!dbConn) {
        throw new Error('Database connection has not yet been established');
    }
    return dbConn;
};

/**
 * @param string requestId
 * @param integer textSize
 * @param integer totalChunks
 * @return Promise
 * @resolve
 */
var createRequestRecord = function (requestId, textSize, totalChunks) {

    return new Promise(function (resolve, reject) {

        getDbConn().collection('requests').insertOne({
            "requestId": requestId,
            "textSize": textSize,
            "status": "in_progress",
            "completedChunks": 0,
            "totalChunks": totalChunks,
            "rawCounts": [],
            "finalCounts": {}
        }, function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

/**
 * @param string requestId
 * @param array chunkCounts
 * @return Promise
 * @resolve
 */
var storeTransitionalChunk = function (requestId, chunkCounts) {

    return new Promise(function (resolve, reject) {

        getDbConn().collection('requests').updateOne(
            { "requestId": requestId },
            { $push: { "rawCounts": chunkCounts }, $inc: { "completedChunks": 1 } },
        function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

/**
 * @param string requestId
 * @param array chunkCounts
 * @param array rawCounts
 * @return Promise
 * @resolve
 */
var storeFinalChunk = function (requestId, chunkCounts, rawCounts) {

    return new Promise(function (resolve, reject) {

        var finalCounts = {};
    
        // Add this chunk's counts to the other chunk counts
        rawCounts.push(chunkCounts);

        rawCounts.forEach(function (rawChunkCounts) {

            rawChunkCounts.forEach(function (rawChunkCount) {

                for (var word in rawChunkCount) {
                    if (typeof finalCounts[word] === 'undefined') {
                        finalCounts[word] = rawChunkCount[word];
                    } else {
                        finalCounts[word] += rawChunkCount[word];
                    }
                }
            });
        });

        getDbConn().collection('requests').updateOne(
            { "requestId": requestId },
            { $set: { "status": "completed", "finalCounts": finalCounts }, $push: { "rawCounts": chunkCounts }, $inc: { "completedChunks": 1 } },
        function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

/**
 * @param string requestId
 * @param array chunkCounts
 * @return Promise
 * @resolve
 */
var storeResults = function (requestId, chunkCounts) {

    return new Promise(function (resolve, reject) {

        getResults({requestId: requestId}, true)
            .then(function (results) {
                // This is the final chunk
                if ((results.completedChunks + 1) === results.totalChunks) {

                    storeFinalChunk(requestId, chunkCounts, results.rawCounts)
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                }
                // Not the final chunk
                else {
                    storeTransitionalChunk(requestId, chunkCounts)
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                }
            })
            .catch(function (err) {
                reject(err);
            });
    });
};

/**
 * @param object request
 * @param boolean passThruDbRecord
 * @return Promise
 * @resolve object
 */
var getResults = function (request, passThruDbRecord) {

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

        var results = {
            requestId: request.requestId,
            textSize: 0,
            status: 'in_progress',
            completedChunks: 0,
            totalChunks: 0,
            finalCounts: {}
        };

        var cursor = getDbConn().collection('requests').find({ "requestId": request.requestId })
          , docsFoundCount = 0;

        cursor.each(function (err, doc) {

            if (err) {
                return reject({
                    code: httpSrvc.NOT_FOUND,
                    message: 'Request id does not exist'
                });
            }

            // A document exists
            if (doc != null) {

                docsFoundCount += 1; // Track whether or not any documents were actually found
                results = doc;

                // Don't return every document field in the case of client consumption
                if (!passThruDbRecord) {
                    delete results._id;
                    delete results.rawCounts;
                }
            }
            // Either no document existed or we're at the end of the cursor
            else {
                // No documents were retrieved. Return 404 Not Found
                if (docsFoundCount < 1) {
                    return reject({
                        code: httpSrvc.NOT_FOUND,
                        message: 'Request id does not exist'
                    });
                }
                // Pass back the captured document
                else {
                    resolve(results);
                }
            }
        });
    });
};


/**
 * PUBLIC API
 */
module.exports = {

    setDbConn: setDbConn,

    getDbConn: getDbConn,

    createRequestRecord: createRequestRecord,

    storeResults: storeResults,

    getResults: getResults

}