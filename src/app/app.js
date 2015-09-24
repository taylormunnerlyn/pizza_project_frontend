import 'app/home/home';
import 'app/login/login';
import 'common/models';
import 'common/modals';

function config ($urlRouterProvider, $locationProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $stateProvider.state('PROJECT_NAME', {
        url: '/',
        abstract: true
    });
}

class MainController {
    constructor () {

    }
}

function run ($rootScope, $window) {
    $rootScope.$on('$stateChangeStart', () => {
        $window.scrollTo(0,0);
    });
}

angular
    .module('PROJECT_NAME', [
        'htmlTemplates',
        'ui.router',
        'ui.bootstrap',
        'models',
        'modals',
        'PROJECT_NAME.home',
        'PROJECT_NAME.login',
    ])
    .config(config)
    .run(run)
    .controller('MainController', MainController);
