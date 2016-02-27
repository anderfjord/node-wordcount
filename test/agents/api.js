'use strict';

/**
 * Package Dependencies
 */
var should = require('should')
  , Restify = require('restify');

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json')
  , uuidSrvc = require('../../lib/services/uuid');


describe('Wordcount API', function() {

    var Client;

    before(function(done) {

        Client = Restify.createJsonClient({
            url: 'http://' + hostConfig.host + ':' + hostConfig.port,
            version: '~1.0'
        });

        done();
    });

    describe('ping the API', function() {

        it('should return an object containing status available', function (done) {
            
            Client.get('/ping', function (err, req, res, obj) {
            
                if (err) {
                    return done(err);
                }

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

            var sample = 'Here is some text';
            
            Client.post('/queue', {text: sample}, function (err, req, res, obj) {
            
                if (err) {
                    return done(err);
                }

                obj.should.be.an.Object;
                obj.should.have.properties(['requestId', 'textSize', 'totalChunks']);
                uuidSrvc.validate(obj.requestId).should.be.true;
                obj.textSize.should.be.Number;
                obj.textSize.should.equal(sample.length);
                obj.totalChunks.should.be.Number;
                obj.totalChunks.should.be.greaterThan(-1);
                done();
            });
        });
    });

    describe('retrieves the results of a count request', function() {

        it('should return an object containing a request id and dictionary of word counts', function (done) {

            var requestId = '00193c01-4bbc-4191-a142-360e090332fe';
            
            Client.get('/results/' + requestId, function (err, req, res, obj) {
            
                if (err) {
                    return done(err);
                }

                obj.should.be.an.Object;
                obj.should.have.properties(['requestId', 'counts']);
                uuidSrvc.validate(obj.requestId).should.be.true;
                obj.counts.should.be.Object;
                done();
            });
        });
    });
});