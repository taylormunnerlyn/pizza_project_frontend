class Modal {
    constructor ($modal) {
        this.$modal = $modal;
    }

    open (name, data, options={}) {
        let lower = name.toLowerCase();
        options = _.extend({
            templateUrl: `common/modals/${lower}/${lower}.tpl.html`,
            controller: name + 'ModalController',
            controllerAs: name + 'Ctrl',
            resolve: {
                data: () => data,
            },
        }, options);
    }
}

angular
    .module('modals', [])
    .service('Modal', Modal);
