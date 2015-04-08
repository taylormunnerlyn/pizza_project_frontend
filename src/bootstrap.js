System.baseURL = '/';
System.transpiler = 'babel';
System
    .import('app/app')
    .then(function () {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ['todomvc']);
        });
    })
    .catch(function (e) {
        console.error(e.stack || e);
    });
