'use strict';

/**
 * UUID Service
 *
 * Handles generating and validating the unique identifiers used by the system
 */

/**
 * Package Dependencies
 */
var UUID = require('node-uuid');

/**
 * Used to validate UUIDs
 */
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


/**
 * @return string
 */
var generate = function () {
    return UUID.v4();
};

/**
 * @param string uuid
 * @return boolean
 */
var validate = function (uuid) {
    return !!uuid.match(UUID_REGEX)
};


/**
 * PUBLIC API
 */
module.exports = {

    generate: generate,

    validate: validate

}