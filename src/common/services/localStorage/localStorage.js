const STORAGE_ID = 'todos-angularjs';

class LocalStorageFactory {
    /* @ngInject */
    constructor ($q) {
        this.$q = $q;
        this.todos = [];
    }

    clearCompleted () {
        let deferred = this.$q.defer(),
            completeTodos = [],
            incompleteTodos = [];

        this.todos.forEach(todo => {
            if (todo.completed) {
                completeTodos.push(todo);
            } else {
                incompleteTodos.push(todo);
            }
        });

        angular.copy(incompleteTodos, this.todos);

        _saveToLocalStorage(this.todos);
        deferred.resolve(this.todos);

        return deferred.promise;
    }

    delete (todo) {
        let deferred = this.$q.defer();

        this.todos.splice(this.todos.indexOf(todo, 1));

        _saveToLocalStorage(this.todos);
        deferred.resolve(this.todos);

        return deferred.promise;
    }

    get () {
        let deferred = this.$q.defer();

        angular.copy(_getFromLocalStorage(), this.todos);
        deferred.resolve(this.todos);

        return deferred.promise;
    }

    insert (todo) {
        let deferred = this.$q.defer();

        this.todos.push(todo);

        _saveToLocalStorage(this.todos);
        deferred.resolve(this.todos);

        return deferred.promise;
    }

    put (todo, index) {
        let deferred = this.$q.defer();

        this.todos[index] = todo;

        _saveToLocalStorage(this.todos);
        deferred.resolve(this.todos);

        return deferred.promise;
    }
}

function _getFromLocalStorage () {
    return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
}

function _saveToLocalStorage (todos) {
    localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
}

angular
    .module('services.localStorage', [])
    .service('localStorage', LocalStorageFactory);
