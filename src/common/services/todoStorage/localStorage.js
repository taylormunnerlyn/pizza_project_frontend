angular
    .module('services.todoStorage.localStorage', [])
    .factory('localStorage', localStorageFactory);

function localStorageFactory($q) {
    const STORAGE_ID = 'todos-angularjs';

    let store = {
        todos: [],
        _getFromLocalStorage: function () {
            return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
        },
        _saveToLocalStorage: function (todos) {
            localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
        },
        clearCompleted: function () {
            let deferred = $q.defer();

            let completeTodos = [];
            let incompleteTodos = [];
            store.todos.forEach(function (todo) {
                if (todo.completed) {
                    completeTodos.push(todo);
                } else {
                    incompleteTodos.push(todo);
                }
            });

            angular.copy(incompleteTodos, store.todos);

            store._saveToLocalStorage(store.todos);
            deferred.resolve(store.todos);

            return deferred.promise;
        },
        delete: function (todo) {
            let deferred = $q.defer();

            store.todos.splice(store.todos.indexOf(todo), 1);

            store._saveToLocalStorage(store.todos);
            deferred.resolve(store.todos);

            return deferred.promise;
        },
        get: function () {
            let deferred = $q.defer();

            angular.copy(store._getFromLocalStorage(), store.todos);
            deferred.resolve(store.todos);

            return deferred.promise;
        },
        insert: function (todo) {
            let deferred = $q.defer();

            store.todos.push(todo);

            store._saveToLocalStorage(store.todos);
            deferred.resolve(store.todos);

            return deferred.promise;
        },
        put: function (todo, index) {
            let deferred = $q.defer();

            store.todos[index] = todo;

            store._saveToLocalStorage(store.todos);
            deferred.resolve(store.todos);

            return deferred.promise;
        }
    };

    return store;
}
