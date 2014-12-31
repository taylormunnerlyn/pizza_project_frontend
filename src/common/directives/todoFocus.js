class TodoFocusDirective {
    constructor($timeout) {
        this.$timeout = $timeout;

        // Make the link function have the proper `this` object.
        this.link = this.link.bind(this);
    }

    link(scope, elem, attrs) {
        scope.$watch(attrs.todoFocus, newVal => {
            if (newVal) {
                this.$timeout(function () {
                    elem[0].focus();
                }, 0, false);
            }
        });
    }
}

angular
    .module('directives.todoFocus', [])
    .directive('todoFocus', function ($timeout) {
        return new TodoFocusDirective($timeout);
    });
