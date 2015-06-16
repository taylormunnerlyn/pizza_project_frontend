(function (module) {
    'use strict';
    module.exports = function (config) {
        config.baseUrl = config.apiHost + '/';
        config.apiUrl = config.baseUrl + 'api/';
        config.authTokenUrl = config.baseUrl + 'api-token-auth/';

        return config;
    };
}(module));
