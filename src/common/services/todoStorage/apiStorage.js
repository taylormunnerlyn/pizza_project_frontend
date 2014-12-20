angular
    .module('todomvc')
    .factory('api', apiFactory);

function apiFactory($http) {
    let store = {
        todos: [],
        clearCompleted: function () {
            let originalTodos = store.todos.slice(0);
            let completeTodos = [];
            let incompleteTodos = [];

            store.todos.forEach(todo => {
                if (todo.completed) {
                    completeTodos.push(todo);
                } else {
                    incompleteTodos.push(todo);
                }
            });

            angular.copy(incompleteTodos, store.todos);

            return $http
                .delete('/api/todos')
                .then(function () {
                    return store.todos;
                }, function () {
                    angular.copy(originalTodos, store.todos);

                    return originalTodos;
                });
        },
        delete: function (todo) {
            let originalTodos = store.todos.slice(0);

            store.todos.splice(store.todos.indexOf(todo), 1);

            return $http
                .delete('/api/todos/' + todo.id)
                .then(function () {
                    return store.todos;
                }, function () {
                    angular.copy(originalTodos, store.todos);
                    return originalTodos;
                });
        },
        get: function () {
            return $http
                .get('/api/todos')
                .then(resp => {
                    angular.copy(resp.data, store.todos);
                    return store.todos;
                });
        },
        insert: function (todo) {
            let originalTodos = store.todos.slice(0);

            return $http
                .post('/api/todos', todo)
                .then(resp => {
                    todo.id = resp.data.id;
                    store.todos.push(todo);
                    return store.todos;
                }, function () {
                    angular.copy(originalTodos, store.todos);
                    return store.todos;
                });
        },
        put: function (todo) {
            let originalTodos = store.todos.slice(0);

            return $http.put('/api/todos/' + todo.id, todo)
                .then(function success() {
                    return store.todos;
                }, function error() {
                    angular.copy(originalTodos, store.todos);
                    return originalTodos;
                });
        }
    };

    return store;
}
