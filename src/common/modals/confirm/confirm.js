class ConfirmModalController {
    constructor ($modalInstance, modalData) {
        this.$modal = $modalInstance;
        this.data = modalData || {};
        _.defaults(this.data, {
            title: 'Confirm',
            body: 'Are you sure?',
            okText: 'Ok',
            cancelText: 'Cancel',
            ok: 'ok',
            cancel: 'cancel',
        });
    }

    ok () {
        this.$modal.close(this.data.ok);
    }

    cancel () {
        this.$modal.dismiss(this.data.cancel);
    }
}

angular.module('modals.confirm', [])
    .controller('ConfirmModalController', ConfirmModalController);
