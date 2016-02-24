'use strict';

/**
 * Package Dependencies
 */
var should = require('should')
  , Restify = require('restify');

/**
 * Local Dependencies
 */
var hostConfig = require('../../config/host.json');


describe('Wordcount API', function() {

    var Client
      , uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
                obj.should.have.properties(['requestId', 'textSize', 'chunks']);
                obj.requestId.match(uuidRegex).should.be.an.Array;
                obj.textSize.should.be.Number;
                obj.textSize.should.equal(sample.length);
                obj.chunks.should.be.Number;
                obj.chunks.should.be.greaterThan(-1);
                done();
            });
        });
    });
});