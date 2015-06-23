import 'common/models/User';

function authRun (auth, $rootScope, $state) {
    auth.init();

    // Listen for state change errors.
    $rootScope.$on('$stateChangeError', stateChangeError);

    function stateChangeError (e, toState, toParams, fromState,
                               fromParams, error) {
        // Check if it was an authentication error.
        if (error && error.auth) {
            if(e) {
                e.preventDefault();
            }

            $state.go('PROJECT_NAME.login', {
                redirectState: toState.name,
                redirectParams: toParams
            }, {location: 'replace'});
        } else {
            console.error(error);
        }
    }
}

class AuthService {
    constructor ($http, $q, $rootScope, $cookies, $state, config, User) {
        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$cookies = $cookies;
        this.$state = $state;
        this.config = config;
        this.User = User;
    }

    /**
     * Initialize the current user if one was already stored in the session
     * storage.
     */
    init () {
        let token = this.$cookies.get('authToken');
        if (token) {
            let userId = this.$cookies.get('userId');
            this._setAuth(token, userId);
            this.setUser(userId).catch(() => {
                this._clearAuth();
            });
        } else {
            let deferred = this.$q.defer();
            deferred.reject();
            this.request = deferred.promise;
        }
    }

    onLogin () {

    }

    onLogout () {
        this.$rootScope.$evalAsync(() => {
            this.$state.go('PROJECT_NAME.login');
        });
    }

    changePassword (token) {
        let pass = prompt('Change Password');
        return this.User.changePassword(token, pass, pass).catch(err => {
            alert(err.error);
        });
    }

    setUser (userId) {
        let deferred = this.$q.defer();

        if(typeof userId === 'string') {
            this.request = this.User.find(userId).then(user => {
                this.user = user;
                this.onLogin();
                deferred.resolve(this.user);
                return user;
            }, err => {
                this._clearAuth();
                if(err.data.detail === 'Invalid token.') {
                    this.$state.go('PROJECT_NAME.login');
                }
                deferred.reject(err);
            });
        } else {
            this.request = deferred.promise;
            if(typeof userId === 'object') {
                this.user = userId;
                this.onLogin();
                deferred.resolve(this.user);
            } else {
                deferred.reject('No userId given');
            }
        }

        return deferred.promise;
    }

    /**
     * Sends a reset password request using the passed email or
     * this.user's primary_email
     *
     * @param {String} email Email to reset password for.
     *
     * @returns {promise}
     */
    resetPassword (email=this.user.email) {
        return this.$http.post(this.config.resetPassword + email + '/');
    }

    /**
     * Assigns a new password for the user, using their validation key
     * @returns {promise}
     */
    assignPassword (validation_key, password) {
        return this.$http
            .post(
                this.config.backendUrl + '/reset/',
                {password: password},
                validation_key
            );
    }

    /**
     * Sets the authToken in the session storage and the Authorization header.
     *
     * @param {string} authToken The auth token to store.
     *
     * @private
     */
    _setAuth (authToken, userId) {
        this.$cookies.put('authToken', authToken);
        this.$cookies.put('userId', userId);
        this.$http.defaults.headers.common.Authorization = 'Token ' + authToken;
    }

    /**
     * Removes the auth token from session storage and the Authorization header.
     *
     * @private
     */
    _clearAuth () {
        this.$cookies.remove('authToken');
        this.$cookies.remove('userId');
        delete this.$http.defaults.headers.common.Authorization;
    }

    /**
     * Sends a request to login the user. If the request was successful the
     * auth token is saved to cookies and the Authorization
     * header is set. If the request failed the auth token and Authorization
     * header will be deleted.
     *
     * @param {string} username Username of the user.
     * @param {string} password Password of the user.
     *
     * @returns {promise}
     */
    login (username, password) {
        let deferred = this.$q.defer();

        this.$http.post(this.config.authTokenUrl, {
            username: username,
            password: password
        }).then(resp => {
            this._setAuth(resp.data.token, resp.data.id);
            this.setUser(resp.data.id).then(
                deferred.resolve,
                deferred.reject
            );
        }, err => {
            this._clearAuth();
            deferred.reject(err);
        });

        return deferred.promise;
    }

    /**
     * Logs out the user by removing the auth token from the app.
     */
    logout () {
        this._clearAuth();
        let deferred = this.$q.defer();
        deferred.reject();
        this.request = deferred.promise;
        if(this.user) {
            this.User.eject(this.user.id);
            this.user = null;
        }
        this.onLogout();
    }

    verify (token) {
        return this.$http.post(this.config.emailVerify + token + '/');
    }

    /**
     * Returns true if the current session has an auth token stored. Returns
     * false otherwise.
     *
     * @returns {boolean}
     */
    isAuthenticated () {
        return !!this.$cookies.get('authToken');
    }

    /**
     * Promise that will resolve when the user is authenticated and reject
     * when they are not. Used for route based authentication.
     *
     * @returns {promise}
     */
    requireLoggedIn () {
        let deferred = this.$q.defer();

        if (this.isAuthenticated()) {
            deferred.resolve({
                auth: 'authenticated',
                loggedIn: true
            });
        } else {
            deferred.reject({
                auth: 'unAuthenticated',
                loggedIn: false
            });
        }

        return deferred.promise;
    }

    resolveUser () {
        return this.request;
    }
}

angular
    .module('services.auth', [
        'config',
        'ngCookies',
        'models.User'
    ])
    .run(authRun)
    .service('auth', AuthService);

