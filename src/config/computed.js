(function (module) {
    'use strict';
    var oauth = [{
        provider: 'google-oauth2',
        name: 'Google',
        icon: '/assets/img/google.svg',
        url: 'https://accounts.google.com/o/oauth2/auth?response_type=code',
        scope: 'openid email profile',
    }, {
        provider: 'facebook',
        name: 'Facebook',
        icon: '/assets/img/facebook.png',
        url: 'https://www.facebook.com/dialog/oauth?',
        scope: 'email',
    }];

    module.exports = function (config) {
        config.baseUrl = config.apiHost + '/';
        config.apiUrl = config.baseUrl + 'api/';
        config.authTokenUrl = config.baseUrl + 'api-token-auth/';
        config.oauthUrl = config.baseUrl + 'social/';
        config.changePassword = config.apiUrl + 'reset/';
        config.resetPassword = config.apiUrl + 'reset-password/';
        config.emailVerify = config.apiUrl + 'verify/';
        config.impersonate = config.apiUrl + 'users/impersonate/';

        if (config.oauth) {
            oauth.forEach(function (o) {
                o.client_id = config.oauth[o.provider];
            });
            config.oauth = oauth;
        }

        return config;
    };
}(module));


