'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var hashSrvc = require('../../../lib/services/hash');


describe('Hash Service', function() {

    describe('generate', function() {

        it('should return a valid md5 hash', function () {
            var md5 = hashSrvc.generate('md5', 'Content to hash');
            md5.should.match(/^[a-f0-9]{32}$/);
        });

        it('should return a valid sha1 hash', function () {
            var sha1 = hashSrvc.generate('sha1', 'Content to hash');
            sha1.should.match(/^[a-f0-9]{40}$/);
        });

        it('should throw an error when an unsupported hash type is supplied', function () {
            hashSrvc.generate.bind(null, 'md5000', 'Content to hash').should.throw();
        });
    });
});