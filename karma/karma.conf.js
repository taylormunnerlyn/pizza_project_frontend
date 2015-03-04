(function (module, require) {
    'use strict';

    var appConfig = require('../config.js'),
        babelOptions = appConfig.babelOptions;

    babelOptions.moduleIds = false;

    module.exports = function (config) {
        config.set({
            // base path that will be used to resolve all patterns (eg. files,
            // exclude).
            basePath: '../',

            plugins: [
                'karma-chrome-launcher',
                'karma-firefox-launcher',
                'karma-jasmine',
                'karma-babel-preprocessor'
            ],

            // frameworks to use
            // available frameworks:
            //   https://npmjs.org/browse/keyword/karma-adapter
            frameworks: ['jasmine'],

            // list of files / patterns to load in the browser
            files: [
                {pattern: 'src/**/*.js', included: false},

                'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
                'node_modules/systemjs/dist/system.src.js',
                'node_modules/systemjs/lib/extension-register.js',
                'bower_components/lodash/lodash.js',
                'bower_components/todomvc-common/base.js',
                'bower_components/angular/angular.js',
                'bower_components/angular-ui-router/release/angular-ui-router.js',
                'bower_components/angular-mocks/angular-mocks.js',
                'karma/test-main.js'
            ],

            // list of files to exclude
            exclude: [

            ],

            // preprocess matching files before serving them to the browser
            // available preprocessors:
            //   https://npmjs.org/browse/keyword/karma-preprocessor
            preprocessors: {
                'src/**/*.tpl.html': ['ng-html2js'],
                'src/**/*.js': ['babel']
            },

            ngHtml2JsPreprocessor: {
                stripPrefix: 'src/',
                moduleName: 'htmlTemplates'
            },

            babelPreprocessor: {
                options: babelOptions
            },

            // test results reporter to use
            // possible values: 'dots', 'progress'
            // available reporters:
            //   https://npmjs.org/browse/keyword/karma-reporter
            reporters: ['progress'],

            // web server port
            port: 9018,

            // enable / disable colors in the output (reporters and logs)
            colors: true,

            // level of logging
            // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
            //   config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
            logLevel: config.LOG_DEBUG,

            // enable / disable watching file and executing tests whenever any
            // file changes
            autoWatch: true,

            // start these browsers
            // available browser launchers:
            //   https://npmjs.org/browse/keyword/karma-launcher
            browsers: ['Chrome', 'Firefox'],

            // Continuous Integration mode
            // if true, Karma captures browsers, runs the tests and exits
            singleRun: false
        });
    };
}(module, require));
