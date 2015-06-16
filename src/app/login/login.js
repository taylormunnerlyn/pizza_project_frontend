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
            this.User.resetPassword(this.username).then(() => {
                alert('Password Reset Email Sent');
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
