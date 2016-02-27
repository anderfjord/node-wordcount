'use strict';

/**
 * Database Service
 *
 * Provides convenience methods around database interactions
 */

/**
 * Package Dependencies
 */
var Promise = require('bluebird')
  , Client = Promise.promisifyAll(require('mariasql'));

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json');

/**
 * @return string
 */
var getDatabaseName = function () {
    return hostConfig.db.database;
};

/**
 * @param object config
 * @param string dbName
 */
var getConnection = function (config, dbName) {

    if (!config) {
        config = hostConfig.db;
    }

    if (!dbName) {
        dbName = config.database;
    }

    var c = new Client();

    var connect = function () {
        return c.connect({
            host: config.host,
            user: config.user,
            password: config.password,
            db: dbName
        });
    };

    connect();

    c.query('USE ' + config.database); // Explicitly specify the database every time a new connection is created.

    return c;
};

/**
 * @param string sql
 * @param object|null dbConn
 * @return Promise
 * @resolve object
 */
var exec = function (sql, dbConn) {
    var closeConnection = true;

    if (dbConn) {
        closeConnection = false;
    } else {
        dbConn = getConnection();
    }

    return new Promise(function(resolve, reject) {

        dbConn.query(sql)
            .on('result', function(res) {
                
                res.on('error', function(err) {
                    reject(err);
                });

                res.on('end', function(info) {
                    resolve(info);
                });
            })
            .on('end', function(info) {
                resolve(info);
            });
    })
    .finally(function () {
        if (closeConnection) {
            dbConn.end();
            dbConn = null;
        }
    });
};

/**
 * @param string sql
 * @param object|null dbConn
 * @return Promise
 * @resolve array
 */
var select = function (sql, dbConn) {
    var closeConnection = true;

    if (dbConn) {
        closeConnection = false;
    } else {
        dbConn = getConnection();
    }

    return new Promise(function(resolve, reject) {
        var rows = []

        dbConn.query(sql)
            .on('result', function(res) {
                
                res.on('row', function (row) {
                    rows.push(row);
                });

                res.on('error', function(err) {
                    reject(err);
                });

                res.on('end', function(info) {
                    resolve(rows);
                });
            })
            .on('end', function(info) {
                resolve(rows);
            });
    })
    .finally(function () {
        if (closeConnection) {
            dbConn.end();
            dbConn = null;
        }
    });
};


/**
 * PUBLIC API
 */
module.exports = {

    getDatabaseName: getDatabaseName,

    getConnection: getConnection,

    exec: exec,

    select: select
}
