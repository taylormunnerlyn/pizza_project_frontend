import 'app/todo/todo';

function config ($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
}

class MainController {
    constructor () {
        this.whatIDo = 'anything';
        this.message = `I don't to ${this.whatIDo}.`;

        console.log(this.message);
    }
}

angular
    .module('todomvc', [
        'htmlTemplates',
        'ui.router',
        'todomvc.todo'
    ])
    .config(config)
    .controller('MainController', MainController);
