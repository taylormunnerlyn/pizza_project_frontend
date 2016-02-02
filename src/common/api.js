import {Paging} from 'common/services/paging';

function apiConfig (DSProvider, DSHttpAdapterProvider, $httpProvider, config) {
    DSProvider.defaults.basePath = config.apiUrl;
    DSHttpAdapterProvider.defaults.forceTrailingSlash = true;
    DSHttpAdapterProvider.defaults.log = false;

    DSProvider.defaults.deserialize = (resourceName, res) => {
        let data = res.data;
        if (data && 'count' in data && 'next' in data && 'results' in data) {
            data = data.results;
            data._meta = {
                count: res.data.count,
                next: res.data.next,
                previous: res.data.previous
            };
        }
        return data;
    };

    $httpProvider.interceptors.push('notifyInterceptor', 'errorInterceptor');
}

function errorInterceptor ($q) {
    function formErrorMessage (obj) {
        if(typeof obj !== 'object') {
            return obj;
        }
        let msg = '';
        if(obj instanceof Array) {
            msg += obj.map(formErrorMessage).join(', ');
        } else {
            _.forOwn(obj, (val, key) => {
                if(['non_field_errors', 'detail'].indexOf(key) < 0) {
                    msg += key + ': ';
                }
                msg += formErrorMessage(val) + '\n';
            });
        }
        return msg;
    }
    function handleError (err) {
        let error;
        switch(err.status) {
            case 500:
                error = 'Server Error';
                break;
            case 0:
                error = 'Unable to connect';
                break;
            default:
                error = formErrorMessage(err.data);
        }
        err.error = error;
        return $q.reject(err);
    }
    return {
        responseError: handleError,
        requestError: handleError
    };
}

function apiRun (DS, DSHttpAdapter, $q, $http) {
    function getResource (model) {
        return DS.definitions[model];
    }

    function getUrl (method, resource, options, id) {
        if (typeof resource === 'string') {
            resource = getResource(resource);
        }
        let path = DSHttpAdapter.getPath(method, resource, id, options);
        if (options.list) {
            path += '/' + options.list;
        }
        if (options.detail) {
            path += '/' + options.detail;
        }
        let trailing = path.slice(-1) === '/';
        if (DSHttpAdapter.defaults.forceTrailingSlash && !trailing) {
            path += '/';
        }
        return path;
    }

    function getActions (url, paging_model='') {
        let actions = {
            get: function (params, options={}) {
                if (params) {
                    options.params = options.params || {};
                    _.extend(options.params, params);
                }
                return $http.get(url, options).then(r => r.data);
            },
            patch: function (data, options) {
                return $http.patch(url, data, options).then(r => r.data);
            },
            post: function (data, options) {
                return $http.post(url, data, options).then(r => r.data);
            },
            put: function (data, options) {
                return $http.put(url, data, options).then(r => r.data);
            }
        };
        if (paging_model) {
            actions.paging = function (params, options={}) {
                options.url = url;
                return DS.paging(paging_model, params, options);
            };
        }
        return actions;
    }

    DS.list = function (model, list) {
        let url = getUrl('findAll', getResource(model), {list});
        return getActions(url, model);
    };

    DS.paging = function (model, params={}, options={}) {
        if (!options.url) {
            options.url = getUrl('findAll', model, options);
        }
        if (params) {
            options.params = options.params || {};
            _.extend(options.params, params);
        }
        return new Paging($q, $http, options, getResource(model));
    };

    DS.findAllPaged = function (model, params={}, options={}) {
        if (!options.url) {
            options.url = getUrl('findAll', model, options);
        }
        if (!options.fetchAll) {
            options.fetchAll = true;
        }
        return DS.paging(model, params, options).init();
    };

    DS.patch = function (model, id, attrs, opts={}) {
        opts.method = 'PATCH';
        return DS.update(model, id, attrs, opts);
    };

    function debouncedUpdate () {
        if (!this._debouncer) {
            let model = this.constructor.name;
            Object.defineProperty(this, '_debouncer', {
                enumerable: false,
                value: _.debounce(() => {
                    let deferred = this._debouncedDeferred;
                    delete this._debouncedDeferred;
                    let changes = this.DSChanges().changed;
                    if(Object.keys(changes).length) {
                        let changedAt = this.DSLastModified();
                        this.DSPatch(changes, {
                            cacheResponse: false
                        }).then(obj => {
                            let newChanges;
                            if (this.DSLastModified() !== changedAt) {
                                newChanges = this.DSChanges().changed;
                            }
                            DS.inject(model, obj);
                            if (newChanges) {
                                // reapply more recent changes
                                _.extend(this, newChanges);
                            }
                            deferred.resolve(this);
                        }, deferred.reject);
                    } else {
                        deferred.resolve(this);
                    }
                }, 500)
            });
        }
        if (!this._debouncedDeferred) {
            Object.defineProperty(this, '_debouncedDeferred', {
                enumerable: false,
                configurable: true,
                value: $q.defer(),
            });
        }
        this._debouncer();
        return this._debouncedDeferred.promise;
    }

    angular.extend(DS.defaults.methods, {
        DSPatch: function (attrs, opts) {
            let resource = getResource(this.constructor.name);
            let id = this[resource.idAttribute];
            return DS.patch(this.constructor.name, id, attrs, opts);
        },
        detail: function (detail) {
            let resource = getResource(this.constructor.name);
            let id = this[resource.idAttribute];
            let url = getUrl('find', resource, {detail}, id);
            return getActions(url);
        },
        debouncedUpdate: debouncedUpdate,
    });
}

angular
    .module('api', [
        'js-data',
    ])
    .factory('errorInterceptor', errorInterceptor)
    .config(apiConfig)
    .run(apiRun);
