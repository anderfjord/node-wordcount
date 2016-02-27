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
        }

        if (!dbName) {
            dbName = config.database;
        }

        var url = 'mongodb://' + config.host + ':' + config.port + '/' + dbName;
    
        Client.connect(url, function(err, db) {
            if (err) {
                reject(err);
            } else {
                resolve(db);
            }
        });
    });
};

/**
 * @param object conn
 */
var closeConnection = function (conn) {
    if (typeof conn.close !== 'undefined') {
        conn.close();
    }
};


/**
 * PUBLIC API
 */
module.exports = {

    getConnection: getConnection,

    closeConnection: closeConnection

}
