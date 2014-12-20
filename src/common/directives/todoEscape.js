angular
    .module('todomvc')
    .directive('todoEscape', todoEscapeDirective);

function todoEscapeDirective() {
    const ESCAPE_KEY = 27;

    return function (scope, elem, attrs) {
        elem.bind('keydown', event => {
            if (event.keyCode === ESCAPE_KEY) {
                scope.$apply(attrs.todoEscape);
            }
        });
    };
}
