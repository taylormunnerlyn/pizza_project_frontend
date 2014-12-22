import 'app/todo/todo';

angular
    .module('todomvc', [
        'htmlTemplates',
        'ui.router',
        'todomvc.todo'
    ])
    .config(config)
    .controller('MainController', MainController);

function config ($urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
}

function MainController() {
    var vm = this;

    vm.message = 'I don\'t do anything';

    console.log(vm.message);
}
