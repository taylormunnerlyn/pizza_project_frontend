class Notify {
    constructor (toastr) {
        this.toastr = toastr;
    }

    b (funcName) {
        if(!funcName || !this[funcName]) {
            throw new Error('Invalid Notify Function: ' + funcName);
        }
        return this[funcName].bind(this);
    }

    success (message, options={}) {
        this.toastr.success(message, options.title, options);
    }

    info (message, options={}) {
        this.toastr.info(message, options.title, options);
    }

    error (message, options={}) {
        this.toastr.error(message, options.title, options);
    }

    warning (message, options={}) {
        this.toastr.warning(message, options.title, options);
    }

    serverError (error) {
        if(!error) {
            console.error('Programming Error: Server Error was null/undefined');
            this.error('Service Error');
        } else if(!error.status) {
            console.error(error);
            this.error('Unable to connect to server!', {
                timeOut: 0,
                extendedTimeout: 2000
            });
        } else if(error.status === 400) {
            this.warning(error.error, {
                title: 'Invalid Request'
            });
        } else if(error.status === 401) {
            this.warning(error.error, {
                title: 'Login Failure'
            });
        } else {
            console.error(error);
            this.error('Server Error', {
                timeOut: 0,
                extendedTimeout: 2000
            });
        }
    }
}

function notifyInterceptor ($q, $injector) {
    var errors = [0, 400, 403, 500],
        Notify;

    function handleError (err) {
        if(!Notify) {
            Notify = $injector.get('Notify');
        }
        if(errors.indexOf(err.status) >= 0) {
            Notify.serverError(err);
        }
        return $q.reject(err);
    }

    return {
        responseError: handleError,
        requestError: handleError
    };
}

function NotifyConfig (toastrConfig) {
    angular.extend(toastrConfig, {
        closeButton: true,
        closeHtml: '<i class="ss-delete"></i>',
        iconClasses: {
          error: 'toastr-error',
          info: 'toastr-info',
          success: 'toastr-success',
          warning: 'toastr-warning'
        },
        messageClass: 'toast-message',
        positionClass: 'toast-bottom toast-container',
        allowHtml: true
    });
}

angular
    .module('services.notify', [
        'ngAnimate',
        'toastr'
    ])
    .service('Notify', Notify)
    .factory('notifyInterceptor', notifyInterceptor)
    .config(NotifyConfig);
