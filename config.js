(function (module) {
    'use strict';

    // Export an object since I want to add comments to this config file.
    module.exports = {
        buildDir: 'build',
        compileDir: 'bin',

        babelOptions: {
            modules: 'system',
            moduleIds: true
        },

        cssAutoPrefixerOptions: {
            cascade: true,
            remove: false
        },

        index: {
            // Define the load order of the scripts in index.html
            scripts: [
                'vendor/es6-module-loader-sans-promises.src.js',
                'vendor/system.src.js',
                'vendor/extension-register.js',
                'vendor/lodash.js',
                'vendor/base.js',
                'vendor/angular.js',
                'vendor/angular-ui-router.js',
                'templates.js',
                'config.js'
            ],
            styles: [
                'vendor/base.css',
                'main.css'
            ]
        },

        appFiles: {
            // Grabs all of the assets for the app.
            assets: ['src/assets/**'],

            // Grab all .js files in the src/ directory and subdirectories aside
            // from tests and asset .js files.
            js: [
                'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'
            ],
            jsTest: ['src/**/*.spec.js'],

            // Grab all of the html template files.
            tpl: ['src/**/*.tpl.html'],

            // The main .html file for the SPA app.
            index: ['src/index.html'],

            // Generally there should only be one .less file and all other files
            // should be imported from this one.
            less: ['src/less/main.less'],

            delta: {
                js: [
                    'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js',
                    '!src/config/**', '.jshintrc'
                ],
                less: ['src/**/*.less', '.csslintrc']
            }
        },

        testFiles: {
            js: [
            ]
        },

        /*
         * Include all of the needed vendor files individually, since I can't
         * control how another package is structured I can't automate this
         * process.
         */
        vendor: {
            js: [
                'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
                'node_modules/systemjs/dist/system.src.js',
                'node_modules/systemjs/lib/extension-register.js',
                'bower_components/lodash/lodash.js',
                'bower_components/todomvc-common/base.js',
                'bower_components/angular/angular.js',
                'bower_components/angular-ui-router/release/angular-ui-router.js'
            ],

            css: [
                'bower_components/todomvc-common/base.css'
            ],

            assets: [
                'bower_components/todomvc-common/bg.png'
            ]
        }
    };
}(module));
