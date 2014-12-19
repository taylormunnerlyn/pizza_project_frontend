/**
 * Place all mocks related to Timey in here so we can use them in any test if
 * needed.
 */
/* exported timeyTest */
var timeyTest = (function () {
    'use strict';

    // Creates a mock config module since it won't exist when running tests.
    angular.module('config', []);
    beforeEach(function () {
        module(function ($provide) {
            $provide.constant('config', {
                backendUrl: '',
                apiBaseUrl: ''
            });
        });

        module('timey');
    });

    return {};
}());
