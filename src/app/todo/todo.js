import 'common/services/localStorage/localStorage';
import 'common/directives/todoEscape';
import 'common/directives/todoFocus';

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

class TodoController {
    /* @ngInject */
    constructor($scope, $stateParams, $filter, localStorage) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$filter = $filter;
        this.localStorage = localStorage;

        localStorage.get();

        this.todos = localStorage.todos;
        this.newTodo = '';
        this.editedTodo = null;
        this.originalTodo = null;
        this.remainingCount = 0;
        this.status = '';
        this.saving = false;
        this.saveEvent = null;
        this.reverted = false;
        this.allChecked = false;
        this.completedCount = 0;

        $scope.$watch(() => this.todos, () => {
            this.remainingCount = $filter('filter')(
                this.todos, {completed: false}
            ).length;
            this.completedCount = this.todos.length - this.remainingCount;
            this.allChecked = !this.remainingCount;
        }, true);

        $scope.$on('$stateChangeSuccess', () => {
            this.status = $stateParams.status || '';

            switch(this.status) {
                case 'active':
                    this.statusFilter = {completed: false};
                    break;
                case 'completed':
                    this.statusFilter = {completed: true};
                    break;
                default:
                    this.statusFilter = null;
                    break;
            }
        });
    }

    addTodo() {
        let newTodo = {
            title: this.newTodo.trim(),
            completed: false
        };

        if (!newTodo.title) {
            return;
        }

        this.saving = true;
        this.localStorage
            .insert(newTodo)
            .then(() => {
                this.newTodo = '';
            })
            .finally(() => {
                this.saving = false;
            });
    }

    editTodo(todo) {
        this.editedTodo = todo;

        // Clone the original todo to restor it on demand.
        this.originalTodo = angular.copy(todo);
    }

    saveEdits(todo, event) {
        // Blur events are automatically triggered after the form submit event.
        // This does some unfortunate logic handling to prevent saving twice.
        if (event === 'blur' && this.saveEvent === 'submit') {
             this.saveEvent = null;
        }

        this.saveEvent = event;

        if (this.reverted) {
            // Todo edits were reverted, don't save.
            this.reverted = false;
            return;
        }

        this.localStorage[todo.title ? 'put' : 'delete'](todo)
            .then(angular.noop, () => {
                todo.title = this.originalTodo.title;
            })
            .finally(() => {
                this.editedTodo = null;
            });
    }

    revertEdits(todo) {
        this.todos[this.todos.indexOf(todo)] = this.originalTodo;
        this.editedTodo = null;
        this.originalTodo = null;
        this.reverted = true;
    }

    removeTodo(todo) {
        this.localStorage.delete(todo);
    }

    saveTodo(todo) {
        this.localStorage.put(todo);
    }

    toggleCompleted(todo, completed) {
        if (angular.isDefined(completed)) {
            todo.completed = completed;
        }

        this.localStorage
            .put(todo, this.todos.indexOf(todo))
            .then(angular.noop, () => {
                todo.completed = !todo.completed;
            });
    }

    clearCompletedTodos() {
        this.localStorage.clearCompleted();
    }

    markAll(completed) {
        this.todos.forEach((todo) => {
            if (todo.completed !== completed) {
                this.toggleCompleted(todo, completed);
            }
        });
    }
}

angular
    .module('todomvc.todo', [
        'ui.router',
        'services.localStorage',
        'directives.todoEscape',
        'directives.todoFocus'
    ])
    .config(config)
    .controller('TodoController', TodoController);
