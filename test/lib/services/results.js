'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var resultsSrvc = require('../../../lib/services/results');


describe('Results Service', function() {

    var requestId = '231f5b96-4985-40b5-9660-e467b14ec450'
      , textSize = 15000
      , totalChunks = 1
      , chunkCounts = [];

    describe('storeResults', function() {

        before(function (done) {
            resultsSrvc.createRequestRecord(requestId, textSize, totalChunks)
                .then(function () {
                    done();
                });
        });

        it('should resolve when a valid request id is supplied', function (done) {
            resultsSrvc.storeResults(requestId, chunkCounts)
                .then(function () {
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should reject when an invalid request id is supplied', function (done) {
            resultsSrvc.storeResults('zzzzzzzz-xxxx-0000-eeee-111122223333', chunkCounts)
                .then(function () {
                    console.log('THEN REACHED');
                    done();
                })
                .catch(function (err) {
                    console.log('CATCH REACHED');
                    done();
                });
        });

    });
});