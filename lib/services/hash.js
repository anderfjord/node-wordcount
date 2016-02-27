'use strict';

/**
 * Package Dependencies
 */
var Crypto = require('crypto');

/**
 *
 */
var SUPPORTED_HASH_TYPES = ['md5', 'sha1'];

/**
 * Creates a hash based on a specified type and content string
 * @param string hashType
 * @param string content
 * @return string
 */
var generate = function (hashType, content) {

    if (-1 === SUPPORTED_HASH_TYPES.indexOf(hashType)) {
        throw new Error('Invalid hash type');
    }

    return Crypto.createHash(hashType).update(content).digest("hex");
};

/**
 * PUBLIC API
 */
module.exports = {

    generate: generate

}