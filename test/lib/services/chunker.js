'use strict';

/**
 * Package Dependencies
 */
var should = require('should')
  , Promise = require('bluebird')
  , Fs = Promise.promisifyAll(require('fs'));

/**
 * Local Dependencies
 */
var chunkerSrvc = require('../../../lib/services/chunker');


describe('Chunker Service', function() {

    var sampleTextFile = 'data/sample.txt'
      , sampleText = '';

    before(function(done) {
        
        Fs.readFileAsync(sampleTextFile)
            .then(function (fileContents) {
                sampleText = fileContents.toString('utf8');
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    describe('loadAmqpChannel', function() {

        it('should resolve a channel object when no config is explicitly supplied', function () {
            var amqpChannel = chunkerSrvc.loadAmqpChannel();
            amqpChannel.should.be.an.Object;
            amqpChannel.should.not.be.false;
        });

        it('should resolve a channel object when a custom config is explicitly supplied', function () {
            var amqpChannel = chunkerSrvc.loadAmqpChannel({
                user: 'guest',
                pass: 'guest',
                host: 'localhost',
                queue: 'wordcount'
            });
            amqpChannel.should.be.an.Object;
            amqpChannel.should.not.be.false;
        });
    });

    describe('setDbConn', function() {

        it('should not throw an error when an object is supplied', function () {
            chunkerSrvc.setDbConn.bind(null, {}).should.not.throw();
        });

        it('should throw an error when a non-object is supplied', function () {
            chunkerSrvc.setDbConn.bind(null, null).should.throw();
        });
    });

    describe('getChunks', function() {

        it('should return an array with a single value when max chunk size is not supplied', function () {
            var chunks = chunkerSrvc.getChunks(sampleText);
            chunks.should.be.an.Array;
            chunks.length.should.be.Number;
            chunks.length.should.equal(1);
        });

        // it('should return an array with multiple values when a small max chunk size is supplied', function () {
        //     var chunks = chunkerSrvc.getChunks(sampleText, 10);
        //     chunks.should.be.an.Array;
        //     chunks.length.should.be.Number;
        //     chunks.length.should.be.greaterThan(1);
        // });
    });
});