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

    DSProvider.defaults.methods = {
        patch: function (attrs, opts={}) {
            opts.method = 'PATCH';
            return this.DSUpdate(attrs, opts);
        },
        debouncedUpdate: _.debounce(function () {
            let changes = this.DSChanges().changed;
            if(Object.keys(changes).length) {
                this.patch(changes);
            }
        }, 500)
    };

    $httpProvider.interceptors.push('errorInterceptor');
}

function errorInterceptor ($q) {
    function formErrorMessage (obj) {
        if(typeof obj !== 'object') {
            return obj;
        }
        let msg = '';
        if(obj instanceof Array) {
            msg += obj.map(item => formErrorMessage(item)).join(', ');
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
        err.error = err.status === 500 ?
            'Server Error' :
            formErrorMessage(err.data);
        return $q.reject(err);
    }
    return {
        responseError: handleError,
        requestError: handleError
    };
}

function apiRun (DS, DSHttpAdapter, $q) {
    let fetched = {};

    function handlePagination (paging, page=1) {
        paging.params.page = page;
        DSHttpAdapter.GET(paging.url, {params: paging.params}).then(res => {
            let objects = DS.inject(paging.model, res.data.results);
            Array.prototype.push.apply(paging.result, objects);
            paging.deferred.notify({
                result: paging.result,
                page: objects,
                progress: paging.result.length / res.data.count
            });

            if(res.data.next) {
                handlePagination(paging, ++page);
            } else {
                paging.deferred.resolve(paging.result);
            }
        }, paging.deferred.reject);
    }

    DS.findAllPaged = DS.findAllPaginated = function (model, params, opts) {
        let deferred = $q.defer(),
            url = DS.defaults.basePath + DS.definitions[model].endpoint,
            result = [],
            promise = deferred.promise;
        promise.$object = result;
        params = params && typeof params === 'object' ? params : {};

        if(fetched[model] && (!opts || opts.cache)) {
            let objects = DS.getAll(model);
            Array.prototype.push.apply(result, objects);
            deferred.resolve(result);
            return promise;
        }
        handlePagination({
            model: model,
            url: url,
            result: result,
            deferred: deferred,
            params: params
        });
        return promise.then(res => {
            fetched[model] = true;
            return res;
        });
    };

    var findAll = DS.findAll.bind(DS);
    DS.findAll = function (...args) {
        let deferred = $q.defer(),
            promise = deferred.promise,
            result = [];
        promise.$object = result;

        findAll(...args).then(objects => {
            Array.prototype.push.apply(result, objects);
            deferred.resolve(result);
        }, deferred.reject);

        return deferred.promise;
    };

    DS.getMasterArray = model => DS.s[model].collection;

    DS.fetchAll = function (model, ids) {
        return $q.all(
            ids.map(id => DS.find(model, id))
        );
    };

    DS.action = function (model, id, action) {
        let url = DS.defaults.basePath + DS.definitions[model].endpoint;
        url += `/${id}/${action}`;
        return {
            get: params => DSHttpAdapter.GET(url, {params: params}),
            post: (payload, params) => DSHttpAdapter.POST(url, payload, {
                params: params
            }),
            put: (payload, params) => DSHttpAdapter.PUT(url, payload, {
                params: params
            })
        };
    };

    DS.list = function (model, list) {
        let url = DS.defaults.basePath + DS.definitions[model].endpoint;
        url += '/' + list;
        return {
            get: params => DSHttpAdapter.GET(url, {params: params}),
            getPaged: params => {
                let deferred = $q.defer(),
                    result = [];
                handlePagination({
                    model: model,
                    url: url,
                    result: result,
                    deferred: deferred,
                    params: params
                });
                return deferred.promise;
            },
            post: (payload, params) => DSHttpAdapter.POST(url, payload, {
                params: params
            }),
            put: (payload, params) => DSHttpAdapter.PUT(url, payload, {
                params: params
            })
        };
    };
}

angular
    .module('api', [
        'js-data'
    ])
    .factory('errorInterceptor', errorInterceptor)
    .config(apiConfig)
    .run(apiRun);