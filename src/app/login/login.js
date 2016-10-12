import 'common/services/auth';
import 'common/models/User';

class LoginController {
    constructor (auth, $state, $stateParams, User, config) {
        this.auth = auth;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.User = User;
        let oauth = [{
            provider: 'google-oauth2',
            name: 'Google',
            icon: '/assets/img/google.svg',
            url: 'https://accounts.google.com/o/oauth2/auth?response_type=code',
            scope: 'openid email profile',
        }, {
            provider: 'facebook',
            name: 'Facebook',
            icon: '/assets/img/facebook.png',
            url: 'https://www.facebook.com/dialog/oauth?',
            scope: 'email',
        }];

        if (config.oauth) {
            this.oauth = oauth.filter(o => o.client_id = config.oauth[o.provider]);
        }
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
    $stateProvider.state('pizza_frontend.login', {
        url: '/login',
        params: {
            redirectState: 'pizza_frontend.order',
            redirectParams: null
        },
                controller: 'LoginController',
                controllerAs: 'LoginCtrl',
                templateUrl: 'app/login/login.tpl.html',
        resolve: {
            $title: function() {return 'Login';},
            user: auth => auth.resolveUser().catch(() => {})
        },
        onEnter: ($state, user) => {
            if(user) {
                $state.go('pizza_frontend.order');
            }
        }
    });
    $stateProvider.state('pizza_frontend.logout', {
        url: 'logout',
        onEnter: auth => {
            auth.logout();
        }
    });
    // $stateProvider.state('pizza_frontend.oauth', {
    //     url: 'oauth/:provider?code&state',
    //     onEnter: ($stateParams, $state, $cookies, Notify, auth) => {
    //         let provider = $stateParams.provider,
    //             storedState = $cookies.get(provider + '-state');
    //         if ($stateParams.state === storedState) {
    //             $cookies.remove(provider + '-state');
    //             auth.oauth(provider, {
    //                 code: $stateParams.code,
    //                 state: storedState
    //             }).then(() => {
    //                 $state.go('pizza_frontend.order');
    //             }, () => {
    //                 Notify.error('Unable to login using oauth', {timeOut: 0});
    //                 $state.go('pizza_frontend.login');
    //             });
    //         } else {
    //             Notify.error('Invalid oauth state!', {timeOut: 0});
    //             $state.go('pizza_frontend.login');
    //         }
    //     }
    // });
}

angular
    .module('pizza_frontend.login', [
        'ui.router',
        'services.auth',
        'models.User',
    ])
    .config(config)
    .controller('LoginController', LoginController);
