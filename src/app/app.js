import 'app/order/order';
import 'app/admin/admin';
import 'app/login/login';
import 'app/pastOrders/pastOrders';
import 'common/models';
import 'common/modals';
import 'common/services';
import 'common/directives';
import 'app/home/home';

function config ($urlRouterProvider, $locationProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $stateProvider.state('pizza_frontend', {
        abstract: true,
        url: '',
        template: '<ui-view></ui-view>'
    });
}

class MainController {
    constructor () {

    }
}

function run ($rootScope, $window, $timeout, $state) {
    $rootScope.$on('$stateChangeStart', () => {
        $window.scrollTo(0,0);
    });

    // adapted from angular-ui-router-title
    $rootScope.updateTitle = updateTitle;
    $rootScope.$on('$stateChangeSuccess', (/*evt, to, toP, from*/) => {
        updateTitle(getTitleValue($state.$current.locals.globals.$title));
//        if(!$window.ga || !from.name) {
//            return;
//        }
//        $window.ga('send', 'pageview', {page: $location.path()});
    });

    function updateTitle (title) {
        $timeout(() => {
            $rootScope.$title = title;
        });

        $rootScope.$breadcrumbs = [{
            title,
            state: $state.$current.self.name,
            stateParams: $state.$current.locals.globals.$stateParams,
        }];
        var state = $state.$current.parent;
        while(state) {
            if(state.resolve && state.resolve.$title) {
                $rootScope.$breadcrumbs.unshift({
                    title: getTitleValue(state.locals.globals.$title),
                    state: state.self.name,
                    stateParams: state.locals.globals.$stateParams
                });
            }
            state = state.parent;
        }
    }

    function getTitleValue (title) {
        return angular.isFunction(title) ? title() : title;
    }
}

angular
    .module('pizza_frontend', [
        'htmlTemplates',
        'ui.router',
        'ui.bootstrap',
        'models',
        'modals',
        'services',
        'directives',
        'pizza_frontend.order',
        'pizza_frontend.login',
        'pizza_frontend.home',
        // 'pizza_frontend.admin',
        // 'pizza_frontend.pastOrders',
    ])
    .config(config)
    .run(run)
    .controller('MainController', MainController);
