import 'common/services/auth/auth';

describe('services.auth', function () {
    var auth, $httpBackend, $window, $http, $rootScope, $cookies,
        $state, sessionStore;

    beforeEach(module('services.auth'));

    beforeEach(inject(function (_auth_, _$httpBackend_, _$window_, _$cookies_,
                                _$http_, _$rootScope_, _sessionStore_,
                                _$state_) {
        auth = _auth_;
        $httpBackend = _$httpBackend_;
        $window = _$window_;
        $http = _$http_;
        $rootScope = _$rootScope_;
        $cookies = _$cookies_;
        $state = _$state_;

        spyOn($state, 'reload');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('auth.run()', function () {
        beforeEach(function () {
            $cookies.authToken = '12345678';
        });

        it('should set the auth token automatically if one already exists',
            function () {
                auth.run();

                expect($http.defaults.headers.common.Authorization)
                    .toEqual('Token 12345678');
            }
        );
    });

    describe('auth.login()', function () {
        beforeEach(function () {
            // Make sure these two values don't initially exist.
            delete $cookies.authToken;
            delete $http.defaults.headers.common.Authorization;
        });

        it('should set the auth credentials if the user is successfully ' +
           'logged in',
            function () {
                auth.login();

                $httpBackend.expectPOST('/api-token-auth/')
                    .respond({token: 'abc123'});
                $httpBackend.flush();

                expect($cookies.authToken).toEqual('abc123');
                expect($http.defaults.headers.common.Authorization)
                    .toEqual('Token abc123');
            }
        );

        // TODO: How to test the rejected promise?
    });

    describe('auth.logout()', function () {
        it('should delete the auth credentials', function () {
            $cookies.authToken = 'testing';
            $http.defaults.headers.common.Authorization = 'testing';

            auth.logout();

            expect(auth.unsetUser).toHaveBeenCalled();

            expect($cookies.authToken).toBeFalsy();
            expect($http.defaults.headers.common.Authorization).toBeFalsy();
        });
    });

    describe('auth.isAuthenticated()', function () {
        it('should return false if no authToken is set and true otherwise',
            function () {
                expect(auth.isAuthenticated()).toBeFalsy();

                $cookies.authToken = 'querty';

                expect(auth.isAuthenticated()).toBeTruthy();
            }
        );
    });

    describe('auth.requireLoggedIn()', function () {
        it('should resolve if the user is authenticated', function () {
            var resolved = false;

            $cookies.authToken = 'test';

            auth
                .requireLoggedIn()
                .then(function () {
                    resolved = true;
                });

            $rootScope.$apply();
            expect(resolved).toEqual(true);
        });

        it('should reject if the user is unauthenticated', function () {
            var rejected = false;

            auth
                .requireLoggedIn()
                .then(undefined, function () {
                    rejected = true;
                });

            $rootScope.$apply();
            expect(rejected).toEqual(true);
        });
    });

    describe('auth.init()', function () {
        it('should set the current user if one exists in the session ' +
           'storage',
            function () {
                auth.init();

                expect(auth.user).toBeUndefined();

                sessionStore
                    .set('user', angular.toJson({username: 'testing'}));

                auth.init();

                expect(auth.user).toBeDefined();
            }
        );
    });

    describe('auth.setUser()', function () {
        it('should set the current user and store their information in ' +
           'the session storage',
            function () {
                auth.setUser({username: 'anothertest'});

                expect(auth.user).toBeDefined();
                expect(sessionStore.get('user')).toBeDefined();
            }
        );
    });

    describe('auth.user', function () {
        it('should return the current user information', function () {
            auth.unsetUser();

            auth.setUser({username: 'hello'});

            expect(auth.user).toEqual({username: 'hello'});
        });
    });

    describe('auth.getUserForSession()', function () {
        it('should send a request to retrieve the user for the set ' +
           'session token',
            function () {
                auth.getUserForSession('test');

                $httpBackend
                    .expectGET('/users/from_token?token=test')
                    .respond({});
                $httpBackend.flush();
            }
        );

        it('should set the current user', function () {
            auth.getUserForSession('hello');

            $httpBackend
                .expectGET('/users/from_token?token=hello')
                .respond({username: 'testing'});
            $httpBackend.flush();

            expect(auth.user).toEqual({username: 'testing'});
        });
    });

    describe('auth.unsetUser()', function () {
        it('should remove the current user information from memory and ' +
           'session store',
            function () {
                auth.setUser({username: 'weeeeeeeeeeeee'});


                expect(auth.user).toBeDefined();
                expect(sessionStore.get('user')).toBeDefined();

                auth.unsetUser();

                expect(auth.user).toBeUndefined();
                expect(sessionStore.get('user')).toBeNull();
            }
        );
    });
});
