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