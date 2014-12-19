//var tests = [];
//for (var file in window.__karma__.files) {
//    if (window.__karma__.files.hasOwnProperty(file)) {
//        if (/\.spec\.js$/.test(file)) {
//            tests.push(file);
//        }
//    }
//}
//var allTestFiles = [];
//var TEST_REGEXP = /(spec)\.js$i/;
//
//var pathToModule = function (path) {
//    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
//};

//__karma__.loaded = function () {};

//Object
//    .keys(window.__karma__.files)
//    .forEach(function (file) {
//        if (TEST_REGEXP.test(file)) {
//            // Normalize paths to RequireJS module names.
//            allTestFiles.push(pathToModule(file));
//        }
//    });

//require.config({
//    // Karma serves files under /base, which is the basePath from you config
//    // file.
//    baseUrl: '/base',
//
//    // Dynamically load all test files.
//    deps: allTestFiles,
//
//    // We have to kickoff jasmine, as it is asynchronous.
//    callback: window.__karma__.start
//});
//
System.config({
    baseURL: '/base/src/',
    paths: {
        'app/*': './app/*.js',
        'common/*': './common/*.js'
    }
});
//
//Promise
//    .all(
//        Object.keys(window.__karma__.files)
//            .filter(onlySpecFiles)
//            .map(function (path) {
//                return path
//                    .replace(/\\/g, '/')
//                    .replace(/.*\/src\//, '')
//                    .replace(/\/assets\//, '/')
//                    .replace(/\/config\//, '/')
//                    .replace(/\/fonts\//, '/')
//                    .replace(/\/less\//, '/')
//                    .replace(/\.\w*$/, '');
//            })
//            .map(function (path) {
//                // TODO: Figure out why baseUrl isn't being applied here.
//                return System
//                    .import(path)
//                    .then(function (test) {
////                        if (test.hasOwnProperty('main')) {
////                            test.main();
////                        }
//                    });
//            })
//    )
//    .then(function () {
//        __karma__.start();
//    }, function (error) {
//        console.error(error.stack || error);
//        __karma__.start();
//    });
//
//
//function onlySpecFiles (path) {
//    return /\.spec\.js$/.test(path);
//}
