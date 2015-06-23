import 'common/services/auth';
import 'common/models/User';

class LoginController {
    constructor (auth, $state, $stateParams, User) {
        this.auth = auth;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.User = User;
    }

    login () {
        this.auth.login(this.username, this.password).then(() => {
            this.$state.go(
                this.$stateParams.redirectState,
                this.$stateParams.redirectParams
            );
        }, err => {
            this.error = err.error;
        });
    }

    reset () {
        if(this.username) {
            this.auth.resetPassword(this.username).then(() => {
                this.error = null;
                alert('Password Reset Email Sent');
            }, err => {
                this.error = err.error;
            });
        }
    }
}

function config ($stateProvider) {
    $stateProvider.state('PROJECT_NAME.login', {
        url: 'login',
        params: {
            redirectState: 'PROJECT_NAME.home',
            redirectParams: null
        },
        views: {
            'main@': {
                controller: 'LoginController',
                controllerAs: 'LoginCtrl',
                templateUrl: 'app/login/login.tpl.html'
            }
        },
        resolve: {
            user: auth => auth.resolveUser().catch(() => {})
        },
        onEnter: ($state, user) => {
            if(user) {
                $state.go('PROJECT_NAME.home');
            }
        }
    });
    $stateProvider.state('PROJECT_NAME.logout', {
        url: 'logout',
        onEnter: auth => {
            auth.logout();
        }
    });
}

angular
    .module('PROJECT_NAME.login', [
        'ui.router',
        'services.auth',
        'models.User',
    ])
    .config(config)
    .controller('LoginController', LoginController);
