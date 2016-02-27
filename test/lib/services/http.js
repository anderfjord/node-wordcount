'use strict';

var should = require('should');
var httpSrvc = require('../../../lib/services/http');

describe('HTTP Service', function() {

    describe('status codes', function() {

        it('CONTINUE should return appropriate HTTP status code', function () {
            httpSrvc.CONTINUE.should.equal(100);
        });

        it('OK should return appropriate HTTP status code', function () {
            httpSrvc.OK.should.equal(200);
        });

        it('REDIRECT_PERM should return appropriate HTTP status code', function () {
            httpSrvc.REDIRECT_PERM.should.equal(301);
        });

        it('REDIRECT_FOUND should return appropriate HTTP status code', function () {
            httpSrvc.REDIRECT_FOUND.should.equal(302);
        });

        it('BAD_REQUEST should return appropriate HTTP status code', function () {
            httpSrvc.BAD_REQUEST.should.equal(400);
        });

        it('UNAUTHORIZED should return appropriate HTTP status code', function () {
            httpSrvc.UNAUTHORIZED.should.equal(401);
        });

        it('FORBIDDEN should return appropriate HTTP status code', function () {
            httpSrvc.FORBIDDEN.should.equal(403);
        });

        it('NOT_FOUND should return appropriate HTTP status code', function () {
            httpSrvc.NOT_FOUND.should.equal(404);
        });

        it('GONE should return appropriate HTTP status code', function () {
            httpSrvc.GONE.should.equal(410);
        });

        it('INTERNAL_ERROR should return appropriate HTTP status code', function () {
            httpSrvc.INTERNAL_ERROR.should.equal(500);
        });
    });

    describe('success status codes', function() {

        it('should return true for success status codes', function () {
            httpSrvc.isSuccessStatus(200).should.be.true();
            httpSrvc.isSuccessStatus(301).should.be.true();
            httpSrvc.isSuccessStatus(302).should.be.true();
        });

        it('should return false for non-success status codes', function () {
            httpSrvc.isSuccessStatus(100).should.be.false();
            httpSrvc.isSuccessStatus(400).should.be.false();
            httpSrvc.isSuccessStatus(401).should.be.false();
            httpSrvc.isSuccessStatus(403).should.be.false();
            httpSrvc.isSuccessStatus(404).should.be.false();
            httpSrvc.isSuccessStatus(410).should.be.false();
            httpSrvc.isSuccessStatus(500).should.be.false();
        });
    });

    describe('error status codes', function() {

        it('should return false for non-error status codes', function () {
            httpSrvc.isErrorStatus(100).should.be.false();
            httpSrvc.isErrorStatus(200).should.be.false();
            httpSrvc.isErrorStatus(301).should.be.false();
            httpSrvc.isErrorStatus(302).should.be.false();
        });

        it('should return true for error status codes', function () {
            httpSrvc.isErrorStatus(400).should.be.true();
            httpSrvc.isErrorStatus(401).should.be.true();
            httpSrvc.isErrorStatus(403).should.be.true();
            httpSrvc.isErrorStatus(404).should.be.true();
            httpSrvc.isErrorStatus(410).should.be.true();
            httpSrvc.isErrorStatus(500).should.be.true();
        });
    });

    describe('not found status codes', function() {

        it('should return false for status codes other than not-found', function () {
            httpSrvc.isNotFoundStatus(100).should.be.false();
            httpSrvc.isNotFoundStatus(200).should.be.false();
            httpSrvc.isNotFoundStatus(301).should.be.false();
            httpSrvc.isNotFoundStatus(302).should.be.false();
            httpSrvc.isNotFoundStatus(400).should.be.false();
            httpSrvc.isNotFoundStatus(401).should.be.false();
            httpSrvc.isNotFoundStatus(403).should.be.false();
            httpSrvc.isNotFoundStatus(410).should.be.false();
            httpSrvc.isNotFoundStatus(500).should.be.false();
        });

        it('should return true for not-found status code', function () {
            httpSrvc.isNotFoundStatus(404).should.be.true();
        });
    });

    describe('generic status codes', function() {

        it('should return false for non-numeric status codes', function () {
            httpSrvc.isStatus('error', 'ENOENT').should.be.false();
        });

        it('should return false for unrecognized status type', function () {
            httpSrvc.isStatus('unrecognized', 200).should.be.false();
        });
    });

    describe('normalize status codes', function() {
        
        it('should return false for non-numeric values', function () {
            httpSrvc.normalizeStatusCode('asdf').should.be.false();
        });

        it('should return an integer for numeric string values', function () {
            httpSrvc.normalizeStatusCode('200').should.equal(200);
        });

        it('should pass thru integer values', function () {
            httpSrvc.normalizeStatusCode(200).should.equal(200);
        });
    });
});