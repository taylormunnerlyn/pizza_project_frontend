(function (module) {
    'use strict';
    function social (config, name, icon, provider) {
        return {
            name: name,
            icon: icon,
            url: config.apiHost + '/social/login/' + provider
        };
    }
    module.exports = function (config) {
        config.baseUrl = config.apiHost + '/';
        config.apiUrl = config.baseUrl + 'api/';
        config.authTokenUrl = config.baseUrl + 'api-token-auth/';
        config.changePassword = config.apiUrl + 'reset/';
        config.resetPassword = config.apiUrl + 'reset-password/';
        config.emailVerify = config.apiUrl + 'verify/';
        config.impersonate = config.apiUrl + 'users/impersonate/';
        config.socialAuth = [
            social(config, 'Google', '/assets/img/google.svg', 'google-oauth2'),
            social(config, 'Facebook', '/assets/img/facebook.png', 'facebook'),
        ];

        return config;
    };
}(module));
