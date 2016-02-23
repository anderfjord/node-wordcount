'use strict';

/**
 * Sends a request to the wordcount API
 *
 * Examples:
 * node run.js -x ping
 * node run.js -x count -t "Some text goes here"
 * node run.js -x count -f ../../data/sample.txt
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
var hostConfig = require('../../config/host.json');

/**
 * CLI argument definition
 */
Program
  .version('1.0.0')
  .option('-x --action-to-perform [string]', 'The type of action to perform.')
  .option('-t --text [string]', 'A body of inline text to be counted')
  .option('-f --file [string]', 'Path to a file containing text to be counted')
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
var supportedActions = ['ping', 'count'];


if (!Program.actionToPerform) {
    throw 'An action must be specified. Supported actions include: ', supportedActions.join(', ');
}
else if (supportedActions.indexOf(Program.actionToPerform) < 0) {
    throw 'Invalid action specified. Supported actions include: ', supportedActions.join(', ');
}
else if ('count' === Program.actionToPerform 
    && (Program.text && Program.file)
) {
    console.log('Please specify either -t OR -f, but not both');
    process.exit();
}
else {
    console.log('Performing action: ', Program.actionToPerform);
}


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


switch (Program.actionToPerform) {

    case 'ping':
        Client.get('/ping', function (err, req, res, obj) {
            if (err) {
                console.log('ERROR: ', err);
            }
            console.log('API returned: %j', obj);
        });
        break;

    case 'count':
        getText(Program)
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
                    console.error('File does not exist: ', Program.file);
                } else {
                    console.error('Error determining text: ', err)
                }
            });
        break;

    default:
        throw 'This should never be reached';
        break;
}

