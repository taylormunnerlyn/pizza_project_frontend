import 'common/services/todoStorage/apiStorage';
import 'common/services/todoStorage/localStorage';

angular
    .module('services.todoStorage', [
        'services.todoStorage.apiStorage',
        'services.todoStorage.localStorage'
    ])
    .factory('todoStorage', todoStorageFactory);

function todoStorageFactory($http, $injector, localStorage, apiStorage) {
    // Detect if an API backend is present. If so, return the API module, else
    // hand off the localStorage adapter.
    return $http.get('/api')
        .then(function () {
            return $injector.get('services.todoStorage.apiStorage');
        }, function () {
            return $injector.get('localStorage');
        });
}
