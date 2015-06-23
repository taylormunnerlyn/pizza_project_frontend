(function (module) {
    'use strict';
    module.exports = function (config) {
        config.baseUrl = config.apiHost + '/';
        config.apiUrl = config.baseUrl + 'api/';
        config.authTokenUrl = config.baseUrl + 'api-token-auth/';
        config.changePassword = config.apiUrl + 'reset/';
        config.resetPassword = config.apiUrl + 'reset-password/';
        config.emailVerify = config.apiUrl + 'verify/';

        return config;
    };
}(module));
