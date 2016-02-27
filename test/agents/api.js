'use strict';

/**
 * Package Dependencies
 */
var should = require('should')
  , Restify = require('restify')
  , Promise = require('bluebird')
  , Fs = Promise.promisifyAll(require('fs'));

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json')
  , httpSrvc = require('../../lib/services/http')
  , uuidSrvc = require('../../lib/services/uuid');


describe('Wordcount API', function() {

    var Client
      , sampleTextFile = 'data/sample.txt'
      , sampleText = ''
      , currentRequestId;

    before(function(done) {

        Client = Restify.createJsonClient({
            url: 'http://' + hostConfig.host + ':' + hostConfig.port,
            version: '~1.0'
        });

        Fs.readFileAsync(sampleTextFile)
            .then(function (fileContents) {
                sampleText = fileContents.toString('utf8');
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    describe('ping the API', function() {

        it('should return an object containing status available', function (done) {
            
            Client.get('/ping', function (err, req, res, obj) {
            
                if (err) { return done(err); }

                obj.should.be.an.Object;
                obj.should.have.properties({
                    name: hostConfig.name + ' API',
                    status: 'available'
                });
                done();
            });
        });
    });

    describe('queue text to be counted', function() {

        it('should return an object containing a request id, text size, and chunk count', function (done) {

            Client.post('/queue', {text: sampleText}, function (err, req, res, obj) {
            
                if (err) { return done(err); }

                obj.should.be.an.Object;
                obj.should.have.properties(['requestId', 'textSize', 'totalChunks']);
                uuidSrvc.validate(obj.requestId).should.be.true;
                obj.textSize.should.be.Number;
                obj.textSize.should.equal(sampleText.length);
                obj.totalChunks.should.be.Number;
                obj.totalChunks.should.be.greaterThan(-1);

                currentRequestId = obj.requestId;

                done();
            });
        });

        it('should return an error object when text property is missing', function (done) {

            Client.post('/queue', {}, function (err, req, res, obj) {
            
                if (!err) { return done('Text property was not present in request but no error thrown'); }

                obj.should.be.an.Object;
                obj.should.have.properties(['code', 'message']);
                httpSrvc.isErrorStatus(obj.code).should.be.true;
                done();
            });
        });
    });

    describe('retrieves the results of a count request', function() {

        it('should return an object containing certain fields in case of success', function (done) {

            Client.get('/results/' + currentRequestId, function (err, req, res, obj) {
            
                if (err) { return done(err); }

                obj.should.be.an.Object;
                obj.should.have.properties(['requestId', 'textSize', 'status', 'completedChunks', 'totalChunks', 'finalCounts']);
                uuidSrvc.validate(obj.requestId).should.be.true;
                obj.textSize.should.be.Number;
                ['in_progress', 'completed'].indexOf(obj.status).should.be.greaterThan(-1);
                obj.completedChunks.should.be.Number;
                obj.totalChunks.should.be.Number;
                obj.finalCounts.should.be.Object;
                
                done();
            });
        });

        it('should return an object containing certain fields in case of failure', function (done) {

            Client.get('/results/12345678-cccc-bbbb-aaaa-1234abcd9876', function (err, req, res, obj) {
            
                if (!err) { return done('Request id does not exist but no error thrown'); }

                obj.should.be.an.Object;
                obj.should.have.properties(['code', 'message']);
                httpSrvc.isErrorStatus(obj.code).should.be.true;
                done();
            });
        });

    });
});