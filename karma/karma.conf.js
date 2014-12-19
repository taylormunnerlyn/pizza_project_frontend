(function (module, require) {
    'use strict';

    module.exports = function (config) {
        var userConfig = require('../config.js'),
            files = [];

        config.set({
            // base path that will be used to resolve all patterns (eg. files,
            // exclude).
            basePath: '../',

            plugins: [
            ],

            // frameworks to use
            // available frameworks:
            //   https://npmjs.org/browse/keyword/karma-adapter
            frameworks: [],

            // list of files / patterns to load in the browser
            files: [
            ],

            // list of files to exclude
            exclude: [

            ],

            // preprocess matching files before serving them to the browser
            // available preprocessors:
            //   https://npmjs.org/browse/keyword/karma-preprocessor
            preprocessors: {
                'src/**/*.tpl.html': ['ng-html2js']
            },

            ngHtml2JsPreprocessor: {
                stripPrefix: 'src/',
                moduleName: 'htmlTemplates'
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
            logLevel: config.LOG_INFO,

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
