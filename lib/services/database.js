'use strict';

/**
 * Database Service
 *
 * Functions as an abstraction layer for loading and interacting with varying databases
 */

module.exports = {
    load: function (driver) {
        return require('../drivers/' + driver)
    }
}
