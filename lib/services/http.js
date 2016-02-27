'use strict';

var statusCodes = {
    CONTINUE: 100,
    OK: 200,
    REDIRECT_PERM: 301,
    REDIRECT_FOUND: 302,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    GONE: 410,
    INTERNAL_ERROR: 500,
    UNAVAILABLE: 503,
    CLOUDFLARE_TIMEOUT: 522
};

var normalizeStatusCode = function (code) {
    code = parseInt(code, 10);
    if (isNaN(code)) {
        return false;
    } else {
        return code;
    }
};

var isStatus = function (type, code) {
    code = normalizeStatusCode(code);
    if ('number' !== typeof code) {
        return false;
    } else {
        switch (type) {
            case 'success':     return code >= 200 && code < 400;
            case 'not_found':   return code === 404 // This has to come before the check-all "is error" condition
            case 'error':       return code >= 400
            default:            return false;
        }
    }
};

var isSuccessStatus = function (code) {
    return isStatus('success', code);
};

var isErrorStatus = function (code) {
    return isStatus('error', code);
};

var isNotFoundStatus = function (code) {
    return isStatus('not_found', code);
};

module.exports = {

    CONTINUE: statusCodes.CONTINUE,

    OK: statusCodes.OK,

    REDIRECT_PERM: statusCodes.REDIRECT_PERM,

    REDIRECT_FOUND: statusCodes.REDIRECT_FOUND,

    BAD_REQUEST: statusCodes.BAD_REQUEST,

    UNAUTHORIZED: statusCodes.UNAUTHORIZED,

    FORBIDDEN: statusCodes.FORBIDDEN,

    NOT_FOUND: statusCodes.NOT_FOUND,

    GONE: statusCodes.GONE,

    INTERNAL_ERROR: statusCodes.INTERNAL_ERROR,

    UNAVAILABLE: statusCodes.UNAVAILABLE,

    isSuccessStatus: isSuccessStatus,

    isErrorStatus: isErrorStatus,

    isNotFoundStatus: isNotFoundStatus,

    isStatus: isStatus,

    normalizeStatusCode: normalizeStatusCode

}