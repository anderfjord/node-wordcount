'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var uuidSrvc = require('../../../lib/services/uuid');


describe('UUID Service', function() {

    describe('generate', function() {
        it('should return a UUID', function () {
            var uuid = uuidSrvc.generate();
            uuid.should.be.a.String;
            uuid.length.should.equal(36);
            uuidSrvc.validate(uuid).should.be.true;
        });
    });

    describe('validate', function() {

        it('should return true for valid UUIDs without regard for case sensitivity', function () {
            uuidSrvc.validate('00193c01-4bbc-4191-a142-360e090332fe').should.be.true;
            uuidSrvc.validate('00193C01-4BBC-4191-A142-360E090332FE').should.be.true;
        });

        it('should return false for an invalid UUID', function () {
            uuidSrvc.validate('00193c01-4bbc-4191-a142-360e090332').should.be.false;
            uuidSrvc.validate('zz193c01-4bbc-4191-a142-360e090332fe').should.be.false;
        });
    });
});