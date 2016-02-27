'use strict';

/**
 * Sends a request to the wordcount API
 *
 * Examples:
 * node run.js -x ping
 * node run.js -x count -t "Some text goes here"
 * node run.js -x count -f ../../data/sample.txt
 * node run.js -x get_results -r 00193c01-4bbc-4191-a142-360e090332fe
 */

/**
 * Package Dependencies
 */
var Promise = require('bluebird')
  , Fs = Promise.promisifyAll(require('fs'))
  , Program = require('commander')
  , Restify = require('restify');

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json')
  , uuidSrvc = require('../services/uuid');

/**
 * CLI argument definition
 */
Program
  .version('1.0.0')
  .option('-x --action-to-perform [string]', 'The type of action to perform.')
  .option('-t --text [string]', 'A body of inline text to be counted')
  .option('-f --file [string]', 'Path to a file containing text to be counted')
  .option('-r --request-id [string]', 'UUID identify a particular count request')
  .parse(process.argv);

/**
 * 
 */
var Client = Restify.createJsonClient({
    url: 'http://' + hostConfig.host + ':' + hostConfig.port,
    version: '~1.0'
});

/**
 * Actions supported by this utility tool
 */
var ACTIONS = ['ping', 'count', 'get_results'];

/**
 * Throws an error or exits if the action fails validation
 * @param object args
 */
var validateActionOrDie = function (args) {

    if (!args.actionToPerform) {
        throw 'An action must be specified. Supported actions include: ', ACTIONS.join(', ');
    }
    else if (ACTIONS.indexOf(args.actionToPerform) < 0) {
        throw 'Invalid action specified. Supported actions include: ', ACTIONS.join(', ');
    }
    else if ('count' === args.actionToPerform 
        && (args.text && args.file)
    ) {
        console.log('Please specify either -t OR -f, but not both');
        process.exit();
    }
    else if ('get_results' === args.actionToPerform) {
        if (!args.requestId) {
            throw 'Must specify a request id using -r';
        }
        else if (!uuidSrvc.validate(args.requestId)) {
            throw 'Invalid request id';
        }
    }
};

/**
 * @param object args
 * @return Promise
 * @resolve string | false
 */
var getText = function (args) {

    return new Promise(function (resolve, reject) {

        if (args.text && typeof args.text === 'string') {
            resolve(args.text);
        }
        else if (args.file && typeof args.file === 'string') {

            Fs.readFileAsync(args.file)
                .then(function (fileContents) {
                    resolve(fileContents.toString('utf8'));
                })
                .catch(function (err) {
                    reject(err);
                });

        } else {
            resolve(false);
        }
    });
};


/**
 * Performs an action based on supplied arguments
 * @param object args
 */
var run = function (args) {

    validateActionOrDie(args);

    console.log('Performing action: ', args.actionToPerform);

    switch (args.actionToPerform) {

        case 'ping':
            Client.get('/ping', function (err, req, res, obj) {
                if (err) {
                    console.log('ERROR: ', err);
                }
                console.log('API returned: %j', obj);
            });
            break;

        case 'count':
            getText(args)
                .then(function (text) {

                    if (!text) {
                        throw 'Text must be supplied via the -t or -f argument';
                    }

                    Client.post('/queue', {text: text}, function (err, req, res, obj) {
                        if (err) {
                            console.log('ERROR: ', err);
                        }
                        console.log('API returned: %j', obj);
                    });
                })
                .catch(function (err) {
                    if (('' + err).indexOf('ENOENT') > -1) {
                        console.error('File does not exist: ', args.file);
                    } else {
                        console.error('Error determining text: ', err)
                    }
                });
            break;

        case 'get_results':
            Client.get('/results/' + args.requestId, function (err, req, res, obj) {
                if (err) {
                    console.log('ERROR: ', err);
                }
                console.log('API returned: %j', obj);
            });
            break;

        default:
            throw 'This should never be reached';
            break;
    }
};

/**
 * Finally, perform the specified action
 */
run(Program);
