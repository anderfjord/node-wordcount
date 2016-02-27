'use strict';

/**
 * Package Dependencies
 */
var should = require('should');

/**
 * Local Dependencies
 */
var counterSrvc = require('../../../lib/services/counter');

/**
 * Sample texts used by tests
 */
var longSampleText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non accumsan augue. Proin justo quam, vulputate id ipsum id, pharetra scelerisque diam. Pellentesque finibus quis quam quis sollicitudin. Mauris non commodo mauris. Maecenas ut suscipit purus. Vivamus ullamcorper velit at nulla malesuada consequat. Vestibulum ut est ac metus auctor dignissim. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam erat volutpat. Curabitur nisl diam, fermentum nec diam ut, eleifend malesuada massa. Vestibulum pulvinar et velit aliquet auctor. Sed eu hendrerit velit. Fusce eget massa in erat gravida aliquam vitae eu nibh. Vivamus eget nisl dui. Ut lectus justo, luctus sit amet interdum ut, congue quis mi."
  , sampleText_12_dupes = "This sentence has exactly twelve words and is no longer than this"
  , sampleText_12_unique = "This sentence has exactly twelve words and is no longer than that";


describe('Counter Service', function() {

    describe('getTopWords', function() {

        it('should return an array containing 10 objects when the body of text fits in a single chunk', function () {

            var topWords = counterSrvc.getTopWords({
                text: sampleText_12_unique,
                totalChunks: 1
            });

            topWords.should.be.an.Array;
            topWords.length.should.be.a.Number;
            topWords.length.should.equal(10);

            topWords.forEach(function (wordObject) {
                for (var word in wordObject) {
                    word.should.be.a.String;
                    word.length.should.be.greaterThan(0);
                    wordObject[word].should.be.a.Number;
                    wordObject[word].should.be.greaterThan(-1);
                }
            });
        });

        it('should return an array containing 12 objects, since chunk contains all unique words, and is one of many chunks', function () {

            var topWords = counterSrvc.getTopWords({
                text: sampleText_12_unique,
                totalChunks: 2
            });

            topWords.should.be.an.Array;
            topWords.length.should.be.a.Number;
            topWords.length.should.equal(12);

            topWords.forEach(function (wordObject) {
                for (var word in wordObject) {
                    word.should.be.a.String;
                    word.length.should.be.greaterThan(0);
                    wordObject[word].should.be.a.Number;
                    wordObject[word].should.be.greaterThan(-1);
                }
            });
        });

        it('should return an array containing 11 objects, since chunk contains one pair of duplicate words, and is one of many chunks', function () {

            var topWords = counterSrvc.getTopWords({
                text: sampleText_12_dupes,
                totalChunks: 2
            });

            topWords.should.be.an.Array;
            topWords.length.should.be.a.Number;
            topWords.length.should.equal(11);

            topWords.forEach(function (wordObject) {
                for (var word in wordObject) {
                    word.should.be.a.String;
                    word.length.should.be.greaterThan(0);
                    wordObject[word].should.be.a.Number;
                    wordObject[word].should.be.greaterThan(-1);
                }
            });
        });

    });
});