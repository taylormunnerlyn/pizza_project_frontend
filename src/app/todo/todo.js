import 'common/services/todoStorage/todoStorage';

angular
    .module('todomvc')
    .config(config)
    .controller('TodoCtrl', TodoController);

function config($stateProvider) {
    
}

function TodoController($scope, $stateParams, $filter, todoStorage) {
    let vm = this;
    let todos = $scope.todos = todoStorage.todos;

    vm.newTodo = '';
    vm.editedTodo = null;

    $scope.$watch(vm.todos, function () {
        vm.remainingCount = $filter('filter')(todos, {completed: false}).length;
        vm.completedCount = todos.length - vm.remainingCount;
        vm.allChecked = !vm.remainingCount;
    }, true);

    // Monitor the current route for changes and adjust the filter accordingly.
    $scope.$on('$stateChangeSuccess', function () {
        let status = vm.status = $stateParams.status || '';

        vm.statusFilter = (status === 'active') ?
            {completed: false} : (status === 'completed') ?
            {completed: true} : null;
    });

    vm.addTodo = function () {
        let newTodo = {
            title: vm.newTodo.trim(),
            completed: false
        };

        if (!newTodo.title) {
            return;
        }

        vm.saving = true;
        todoStorage
            .insert(newTodo)
            .then(function success() {
                vm.newTodo = '';
            })
            .finally(function () {
                vm.saving = false;
            });
    };

    vm.editTodo = function (todo) {
        vm.editedTodo = todo;
        // Clone the original todo to restore it on demand.
        vm.originalTodo = angular.extend({}, todo);
    };

    vm.saveEdits = function (todo, event) {
        // Blur events are automatically triggered after the form submit event.
        // This does some unfortunate logic handling to prevent saving twice.
        if (event === 'blur' && vm.saveEvent === 'submit') {
            vm.saveEvent = null;
            return;
        }

        vm.saveEvent = event;

        if (vm.reverted) {
            // Todo edits were reverted-- don't save.
            vm.reverted = null;
            return;
        }

        todo.title = todo.title.trim();

        if (todo.title === vm.originalTodo.title) {
            return;
        }

        todoStorage[todo.title ? 'put' : 'delete'](todo)
            .then(function success() {}, function error() {
                todo.title = vm.originalTodo.title;
            })
            .finally(function () {
                vm.editedTodo = null;
            });
    };

    vm.revertEdits = function (todo) {
        todos[todos.indexOf(todo)] = vm.originalTodo;
        vm.editedTodo = null;
        vm.originalTodo = null;
        vm.reverted = true;
    };

    vm.removeTodo = function (todo) {
        todoStorage.delete(todo);
    };

    vm.saveTodo = function (todo) {
        todoStorage.put(todo);
    };

    vm.toggleCompleted = function (todo, completed) {
        if (angular.isDefined(completed)) {
            todo.completed = completed;
        }

        todoStorage.put(todo, todos.indexOf(todo))
            .then(function success() {}, function error() {
                todo.completed = !todo.completed;
            });
    };

    vm.clearCompletedTodos = function () {
        todoStorage.clearCompleted();
    };

    vm.markAll = function (completed) {
        todos.forEach(function (todo) {
            if (todo.completed !== completed) {
                vm.toggleCompleted(todo, completed);
            }
        });
    };
}