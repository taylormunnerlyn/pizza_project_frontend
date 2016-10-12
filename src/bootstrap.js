System.baseURL = '/';
System.transpiler = 'babel';
System
    .import('app/app')
    .then(function () {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ['pizza_frontend']);
        });
    })
    .catch(function (e) {
        console.error(e.stack || e);
    });
