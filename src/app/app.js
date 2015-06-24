import 'app/home/home';
import 'app/login/login';
import 'common/models';

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

angular
    .module('PROJECT_NAME', [
        'htmlTemplates',
        'ui.router',
        'models',
        'PROJECT_NAME.home',
        'PROJECT_NAME.login',
    ])
    .config(config)
    .controller('MainController', MainController);
