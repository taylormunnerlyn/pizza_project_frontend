function rand () {
    return Math.ceil(Math.random() * 1000000000000);
}

function socialAuth ($cookies) {
    return {
        restrict: 'E',
        scope: {
            oauth: '=',
        },
        templateUrl: 'common/directives/socialAuth/socialAuth.tpl.html',
        link: scope => {
            let redirect = `${location.protocol}//${location.host}/oauth/`,
                state = rand();
            $cookies.put(scope.oauth.provider + '-state', state);

            scope.url = (
                scope.oauth.url +
                `&client_id=${scope.oauth.client_id}` +
                `&scope=${scope.oauth.scope}` +
                `&redirect_uri=${redirect + scope.oauth.provider}` +
                `&state=${state}`
            );
        }
    };
}

angular.module('directives.socialAuth', [])
    .directive('socialAuth', socialAuth);
