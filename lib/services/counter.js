'use strict';

/**
 * Counter Service
 *
 * Handles extracting words and determining frequency
 */

/**
 * Local Dependencies
 */
var chunkerSrvc = require('./chunker');


/**
 * @param string chunk
 * @return array
 */
var getTopWords = function (chunk) {

    var topThreshold
      , topWords = []
      , wordCounts = {}
      , words = chunkerSrvc.formatChunk(chunk.text).split(' ')
      , word;

    // Keep just the top 10 if the input all fit in a single chunk
    if (parseInt(chunk.totalChunks, 10) === 1) {
        topThreshold = 10;
    }
    // Keep more if there are multiple chunks, in order to avoid disparities in counts across chunks
    else {
        topThreshold = 50;
    }

    words.forEach(function (word) {
        if (typeof wordCounts[word] === 'undefined') {
            wordCounts[word] = 1;
        } else {
            wordCounts[word] += 1;
        }
    });

    var counts = [];

    for (word in wordCounts) {
        counts.push({
            word: word,
            count: wordCounts[word]
        });
    }

    topWords = counts.sort(function (a, b) {
        return (a.count > b.count) ? -1 : ((a.count < b.count) ? 1 : 0);
    });

    topWords = topWords.slice(0, topThreshold);
    topWords = normalizeCountObjects(topWords);

    // console.log('TOP WORDS: ', topWords);

    return topWords;
};

/**
 * @param array objects
 * @return array
 */
var normalizeCountObjects = function (objects) {

    var normalized = [];

    objects.forEach(function (obj) {
        var newObj = {};
        newObj[obj.word] = obj.count;
        normalized.push(newObj);
    });

    return normalized;
};


/**
 * PUBLIC API
 */
module.exports = {

    getTopWords: getTopWords,

    normalizeCountObjects: normalizeCountObjects

}