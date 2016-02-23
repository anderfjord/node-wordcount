'use strict';

/**
 * Frigg API
 *
 * Exposes an api for queuing crawls and retrieving data
 */

/**
 * Package Dependencies
 */
var Restify = require('restify');
  
/**
 * Local Dependencies
 */
var hostConfig = require('../config/host.json')
  , httpSrvc = require('../lib/services/http')
  , chunkerSrvc = require('../lib/services/chunker');

/**
 * Creates and configures the server
 */
var server = Restify.createServer({
    name: hostConfig.name + ' API',
    version: '1.0.0'
}).use(Restify.bodyParser());

/**
 * Provides an easy way to ascertain if the api is up
 */
server.get('/ping', function (req, res, next) {
    res.send(httpSrvc.OK, {
        name: hostConfig.name + ' API',
        status: 'available'
    });
    next();
});

/**
 * Queues text body for counting
 */
server.post('/queue', function (req, res) {

    chunkerSrvc.queue(req.params)
        .then(function (result) {

            var response = {
                requestId: result.requestId, // A unique id is attached to every request that comes through the API
                chunks: result.chunks
            };

            res.status(httpSrvc.OK);
            res.json(response);
        })
        .catch(function (err) {
            res.status(err.code || httpSrvc.INTERNAL_ERROR); // Error codes are reflected in the response body in order to control exactly what error info is available to the client.
            res.json({
                message: err.message || 'Request refused'
            });
        });
});

/**
 * Starts the server
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
