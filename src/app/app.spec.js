import 'app/app';

angular.module('config', []);
angular.module('htmlTemplates', []);

describe('testing', function () {
    var $rootScope;

    beforeEach(module('PROJECT_NAME'));

    beforeEach(inject(function (_$rootScope_) {
        $rootScope = _$rootScope_;
    }));

    it('should work maybe', function () {
        expect(true).toBe(true);

        expect($rootScope).toBeDefined();
    });
});
