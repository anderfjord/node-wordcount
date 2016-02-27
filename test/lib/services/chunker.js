'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var chunkerSrvc = require('../../../lib/services/chunker');

/**
 * Sample text used by tests
 */
var sampleText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non accumsan augue. Proin justo quam, vulputate id ipsum id, pharetra scelerisque diam. Pellentesque finibus quis quam quis sollicitudin. Mauris non commodo mauris. Maecenas ut suscipit purus. Vivamus ullamcorper velit at nulla malesuada consequat. Vestibulum ut est ac metus auctor dignissim. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam erat volutpat. Curabitur nisl diam, fermentum nec diam ut, eleifend malesuada massa. Vestibulum pulvinar et velit aliquet auctor. Sed eu hendrerit velit. Fusce eget massa in erat gravida aliquam vitae eu nibh. Vivamus eget nisl dui. Ut lectus justo, luctus sit amet interdum ut, congue quis mi.";


describe('Chunker Service', function() {

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