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
var chunkerSrvc = require('../../../lib/services/chunker')
  , uuidSrvc = require('../../../lib/services/uuid')
  , databaseSrvc = require('../../../lib/services/database').load('mongo');


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

        it('should return an array with a single value when max chunk size is supplied, but sufficiently low', function () {
            var chunks = chunkerSrvc.getChunks(sampleText, 50000);
            chunks.should.be.an.Array;
            chunks.length.should.be.Number;
            chunks.length.should.equal(1);
        });

        it('should return an array with a single value when max chunk size is supplied, but exceeding max config size', function () {
            var chunks = chunkerSrvc.getChunks(sampleText, 100000);
            chunks.should.be.an.Array;
            chunks.length.should.be.Number;
            chunks.length.should.equal(1);
        });

    });

    describe('queue', function() {

        var dbConn;

        before(function(done) {
        
            databaseSrvc.getConnection()
                .then(function (conn) {
                    chunkerSrvc.setDbConn(conn);
                    dbConn = conn;
                    done();
                });
        });

        after(function() {
            databaseSrvc.closeConnection(dbConn);
        });

        it('should throw an error when the text property is not defined', function (done) {
            chunkerSrvc.queue({})
                .then(function () {
                    done('chunkerSrvc.queue should throw when no text property is defined');
                })
                .catch(function (err) {
                    done();
                });
        });

        it('should throw an error when the text property is not a string', function (done) {
            chunkerSrvc.queue({text: 512})
                .then(function () {
                    done('chunkerSrvc.queue should throw when no text property is defined');
                })
                .catch(function (err) {
                    done();
                });
        });

        it('should resolve an object when the text property is defined and is a string', function (done) {
            chunkerSrvc.queue({text: sampleText})
                .then(function (result) {
                    result.should.be.an.Object;
                    result.should.have.properties(['requestId', 'textSize', 'totalChunks']);
                    uuidSrvc.validate(result.requestId).should.be.true;
                    result.textSize.should.be.a.Number;
                    result.textSize.should.be.greaterThan(0);
                    result.totalChunks.should.be.a.Number;
                    result.totalChunks.should.be.greaterThan(0);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

    });
});