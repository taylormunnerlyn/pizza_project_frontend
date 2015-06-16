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

    $httpProvider.interceptors.push('errorInterceptor');
}

function errorInterceptor ($q) {
    function formErrorMessage (obj) {
        if(typeof obj !== 'object') {
            return obj;
        }
        let msg = '';
        if(obj instanceof Array) {
            obj.forEach(item => {
                msg += formErrorMessage(item);
            });
        } else {
            _.forOwn(obj, (val, key) => {
                msg += key + ': ';
                msg += val instanceof Array ? val.join(', ') : val;
                msg += '\n';
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
    DS.findAllPaginated = function (model, params={}) {
        let deferred = $q.defer(),
            url = DS.defaults.basePath + DS.definitions[model].endpoint,
            result = [],
            promise = deferred.promise;
        promise.$object = result;

        handlePagination();

        function handlePagination (page=1) {
            params.page = page;
            DSHttpAdapter.GET(url, {params: params}).then(res => {
                let objects = DS.inject(model, res.data.results);
                Array.prototype.push.apply(result, objects);
                deferred.notify({
                    result: result,
                    page: objects,
                    progress: result.length / res.data.count
                });

                if(res.data.next) {
                    handlePagination(++page);
                } else {
                    deferred.resolve(result);
                }
            }, deferred.reject);
        }

        return promise;
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
