function socialAuth () {
    return {
        restrict: 'E',
        scope: {
            auth: '=',
        },
        templateUrl: 'common/directives/socialAuth/socialAuth.tpl.html',
    };
}

angular.module('directives.socialAuth', [])
    .directive('socialAuth', socialAuth);
