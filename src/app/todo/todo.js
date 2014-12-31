import 'common/services/localStorage/localStorage';
import 'common/directives/todoEscape';
import 'common/directives/todoFocus';

angular
    .module('todomvc.todo', [
        'ui.router',
        'services.localStorage',
        'directives.todoEscape',
        'directives.todoFocus'
    ])
    .config(config)
    .controller('TodoController', TodoController);

function config($stateProvider) {
    $stateProvider.state('todo', {
        url: '/:status',
        views: {
            'main': {
                controller: 'TodoController',
                controllerAs: 'TodoCtrl',
                templateUrl: 'app/todo/todo.tpl.html'
            }
        }
    });
}

function TodoController($scope, $stateParams, $filter, localStorage) {
    let vm = this;
    let todos = vm.todos = localStorage.todos;

    localStorage.get();

    vm.newTodo = '';
    vm.editedTodo = null;

    $scope.$watch(function () {
        return vm.todos;
    }, function () {
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
        localStorage
            .insert(newTodo)
            .then(function () {
                vm.newTodo = '';
            })
            .finally(function () {
                vm.saving = false;
            });
    };

    vm.editTodo = function (todo) {
        vm.editedTodo = todo;
        // Clone the original todo to restore it on demand.
        vm.originalTodo = angular.copy(todo);
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

        localStorage[todo.title ? 'put' : 'delete'](todo)
            .then(
                angular.noop,
                function() {
                    todo.title = vm.originalTodo.title;
                }
            )
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
        localStorage.delete(todo);
    };

    vm.saveTodo = function (todo) {
        localStorage.put(todo);
    };

    vm.toggleCompleted = function (todo, completed) {
        if (angular.isDefined(completed)) {
            todo.completed = completed;
        }

        localStorage.put(todo, todos.indexOf(todo))
            .then(
                angular.noop,
                function () {
                    todo.completed = !todo.completed;
                }
            );
    };

    vm.clearCompletedTodos = function () {
        localStorage.clearCompleted();
    };

    vm.markAll = function (completed) {
        todos.forEach(function (todo) {
            if (todo.completed !== completed) {
                vm.toggleCompleted(todo, completed);
            }
        });
    };
}