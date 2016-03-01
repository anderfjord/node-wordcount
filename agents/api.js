'use strict';

/**
 * Frigg API
 *
 * Exposes an api for queuing crawls and retrieving data
 */

/**
 * Package Dependencies
 */
var Restify = require('restify')
  , os = require('os');
  
/**
 * Local Dependencies
 */
var hostConfig = require('../config/host.json')
  , httpSrvc = require('../lib/services/http')
  , chunkerSrvc = require('../lib/services/chunker')
  , resultsSrvc = require('../lib/services/results')
  , databaseSrvc = require('../lib/services/database').load('mongo');

/**
 * Immediately acquire a database connection and close it on process exit
 */
var dbConn;
databaseSrvc.getConnection()
    .then(function (conn) {

        chunkerSrvc.setDbConn(conn);
        dbConn = conn;

        dbConn.collection('requests').createIndex(
            { "requestId": 1 },
            { "background": 1 },
        function (err, results) {
            loadServer();
        });
    });

var handleProcessExit = function () {
    databaseSrvc.closeConnection(dbConn);
    process.exit('SIGKILL');
};

process.on('SIGINT', handleProcessExit);
process.on('SIGHUP', handleProcessExit);
process.on('SIGTERM', handleProcessExit);
process.on('uncaughtException', handleProcessExit);


/**
 * Encapsulate loading of the server
 */
var loadServer = function () { 

    var fileUploadContents = [];

    /**
     * Creates and configures the server
     */
    var server = Restify.createServer({
        name: hostConfig.name + ' API',
        version: '1.0.0'
    }); // .use(Restify.bodyParser());

    server.use(Restify.acceptParser(server.acceptable));
    server.use(Restify.queryParser());
    // server.use(Restify.CORS());
    server.use(Restify.gzipResponse());
    server.use(Restify.bodyParser({
        maxBodySize: 0,
        mapParams: true,
        mapFiles: false,
        overrideParams: false,
        multipartHandler: function(part) {
            part.on('data', function(data) {
                fileUploadContents.push(data.toString());
            });
        },
        multipartFileHandler: function(part) {
            part.on('data', function(data) {
                fileUploadContents.push(data.toString());
            });
        },
        keepExtensions: false,
        uploadDir: os.tmpdir(),
        multiples: true,
        hash: 'sha1'
     }));
    
    /**
     * STATIC
     */

    // Index page
    server.get('/', Restify.serveStatic({
        directory: 'public/html',
        default: 'index.html'
    }));

    // CSS
    server.get(/\/css\/?.*$/, Restify.serveStatic({
        directory: 'public'
    }));

    // JavaScript
    server.get(/\/js\/?.*$/, Restify.serveStatic({
        directory: 'public'
    }));


    /**
     * REST
     */

    // Provides an easy way to ascertain if the api is up
    server.get('/ping', function (req, res, next) {
        res.send(httpSrvc.OK, {
            name: hostConfig.name + ' API',
            status: 'available'
        });
        next();
    });

    // Queues a body of text for counting
    server.post('/queue', function (req, res) {

        chunkerSrvc.queue(req.params)
            .then(function (result) {
                res.status(httpSrvc.OK);
                res.json(result);
            })
            .catch(function (err) {
                res.status(err.code || httpSrvc.INTERNAL_ERROR); // Error codes are reflected in the response body in order to control exactly what error info is available to the client.
                res.json({
                    code: err.code,
                    message: err.message || 'Bad Request'
                });
            });
    });

    // Handles an uploaded file containing text for counting
    server.post('/upload', function (req, res) {

        var fileText = fileUploadContents.join(' ');
        fileUploadContents = [];
        
        chunkerSrvc.queue({text: fileText})
            .then(function (result) {
                res.status(httpSrvc.OK);
                res.json(result);
            })
            .catch(function (err) {
                res.status(err.code || httpSrvc.INTERNAL_ERROR); // Error codes are reflected in the response body in order to control exactly what error info is available to the client.
                res.json({
                    code: err.code,
                    message: err.message || 'Bad Request'
                });
            });
    });

    // Gets count results based on a uuid
    server.get('/results/:requestId', function (req, res, next) {

        resultsSrvc.getResults(req.params)
            .then(function (result) {
                res.send(httpSrvc.OK, result);
            })
            .catch(function (err) {
                res.send(err.code, { code: err.code, message: err.message });
            })
            .finally(function () {
                next();
            });
    });

    /**
     * Start the server
     */
    server.listen(process.env.PORT || hostConfig.port, hostConfig.host, function (err) {
        if (err) {
            var msg = 'API server failed on startup';
            throw new Error(msg);
        } else {
            console.log('-------------------------------------------------------------------------------');
            console.log(' Starting ' + server.name + ' - ', server.address());
            console.log('-------------------------------------------------------------------------------');
        }
    });
};
