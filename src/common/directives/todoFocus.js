angular
    .module('directives.todoFocus', [])
    .directive('todoFocus', todoFocusDirective);

function todoFocusDirective($timeout) {
    return function (scope, elem, attrs) {
        scope.$watch(attrs.todoFocus, newVal => {
            if (newVal) {
                $timeout(function () {
                    elem[0].focus();
                }, 0, false);
            }
        });
    };
}
