'use strict';

/**
 * MongoDB Driver
 *
 * Provides convenience methods around MongoDB interactions
 */

/**
 * Package Dependencies
 */
var Promise = require('bluebird')
  , Client = require('mongodb').MongoClient;

/**
 * Local Dependencies
 */
var dbConfig = require('../../config/host.json').db.mongo;


/**
 * @param object config
 * @param string dbName
 * @return Promise
 * @resolve object
 */
var getConnection = function (config, dbName) {

    return new Promise(function (resolve, reject) {

        if (!config) {
            config = dbConfig;
        } else if (!config.host || !config.port) {
            return reject('Invalid config supplied to Mongo driver');
        }

        if (!dbName && config.database) {
            dbName = config.database;
        }

        var url = 'mongodb://' + config.host + ':' + config.port + '/' + dbName;

        var options = {
            server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
            replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
        };

        Client.connect(url, options, function (err, db) {
            resolve(db);
        });
    });
};

/**
 * @param object conn
 */
var closeConnection = function (conn) {
    if (conn && typeof conn.close !== 'undefined') {
        conn.close();
        conn = null;
    }
};


/**
 * PUBLIC API
 */
module.exports = {

    getConnection: getConnection,

    closeConnection: closeConnection

}
