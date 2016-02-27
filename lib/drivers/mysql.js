'use strict';

/**
 * MySQL Driver
 *
 * Provides convenience methods around MySQL interactions
 */

/**
 * Package Dependencies
 */
var Promise = require('bluebird')
  , Client = Promise.promisifyAll(require('mariasql'));

/**
 * Local Dependencies
 */
var dbConfig = require('../../config/host.json').db.mysql;


/**
 * @param object config
 * @param string dbName
 * @return Promise
 * @resolve object
 */
var getConnection = function (config, dbName) {

    return new Promise(function (resolve, reject) {

        if (!config) { config = dbConfig; }
        if (!dbName) { dbName = config.database; }

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

        resolve(c);
    });
};

/**
 * @param object conn
 */
var closeConnection = function (conn) {
    if (typeof conn.close !== 'undefined') {
        conn.end();
        conn = null;
    }
};

/**
 * @param string sql
 * @param object|null dbConn
 * @return Promise
 * @resolve object
 */
var exec = function (sql, dbConn) {
    var shouldCloseConnection = true;

    if (dbConn) {
        shouldCloseConnection = false;
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
        if (shouldCloseConnection) {
            closeConnection(dbConn);
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
    var shouldCloseConnection = true;

    if (dbConn) {
        shouldCloseConnection = false;
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
        if (shouldCloseConnection) {
            closeConnection(dbConn);
        }
    });
};


/**
 * PUBLIC API
 */
module.exports = {

    getConnection: getConnection,

    closeConnection: closeConnection,

    exec: exec,

    select: select
}
