import 'common/modals/confirm/confirm';

class Modal {
    constructor ($modal) {
        this.$modal = $modal;
    }

    open (name, modalData, options={}) {
        let lower = name.toLowerCase();
        _.defaultsDeep(options, {
            templateUrl: `common/modals/${lower}/${lower}.tpl.html`,
            controller: name + 'ModalController',
            controllerAs: name + 'Ctrl',
            resolve: {
                data: function () {
                    return modalData;
                },
            },
        });
        return this.$modal.open(options).result;
    }
}

angular
    .module('modals', [
        'modals.confirm',
    ])
    .service('Modal', Modal);
