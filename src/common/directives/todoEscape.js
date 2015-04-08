const ESCAPE_KEY = 27;

class TodoEscapeDirective {
    link (scope, elem, attrs) {
        elem.bind('keydown', event => {
            if (event.keyCode === ESCAPE_KEY) {
                scope.$apply(attrs.todoEscape);
            }
        });
    }
}

angular
    .module('directives.todoEscape', [])
    .directive('todoEscape', () => {
        return new TodoEscapeDirective();
    });
