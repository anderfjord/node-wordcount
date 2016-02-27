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
  , uuidSrvc = require('../../lib/services/uuid');


describe('Wordcount API', function() {

    var Client
      , sampleTextFile = 'data/sample.txt'
      , sampleText = '';

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
                done();
            });
        });
    });

    describe('retrieves the results of a count request', function() {

        it('should return an object containing certain fields in case of success', function (done) {

            Client.get('/results/00193c01-4bbc-4191-a142-360e090332fe', function (err, req, res, obj) {
            
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

            Client.get('/results/00193c01-4bbc-4191-a142-360e090332fe', function (err, req, res, obj) {
            
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

    });
});