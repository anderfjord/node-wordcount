'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var chunkerSrvc = require('../../../lib/services/chunker');


describe('Chunker Service', function() {

    describe('getChunks', function() {

        it('should return a non-empty array', function () {
            var chunks = chunkerSrvc.getChunks('Here is some text');
            chunks.should.be.an.Array;
            chunks.length.should.be.Number;
            chunks.length.should.be.greaterThan(0);
        });
    });
});