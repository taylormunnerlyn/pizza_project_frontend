__karma__.loaded = function () {};

System.baseURL = '/base/src/';
System.transpiler = 'babel';

Promise
    .all(
        Object
            .keys(window.__karma__.files)
            .filter(function (path) {
                return /\.spec\.js$/.test(path);
            })
            .map(function (path) {
                return path.split('/base/src/')[1].split('.js')[0];
            })
            .map(function (path) {
                return System.import(path);
            })
    )
    .then(function () {
        __karma__.start();
    }, function (error) {
        __karma__.start();
        throw new Error(error.stack || error);
    });
