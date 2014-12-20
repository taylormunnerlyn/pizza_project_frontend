angular
    .module('todomvc', ['ui.router'])
    .config(config);


function config ($urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
}
