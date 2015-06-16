import 'common/api';

function UserFactory (DS, DSHttpAdapter, config, $http) {
    let User = DS.defineResource({
        name: 'User',
        endpoint: 'users',
        relations: {

        },
        methods: {
            uploadImage: function (blob) {
                let fd = new FormData();
                fd.append('file', blob);
                let url = `${config.apiUrl}user/${this.id}/image/`;

                return $http.put(url, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(() => {
                    return DS.refresh('User', this.id);
                });
            },
        },
        computed: {
            fullName: ['first_name', 'last_name', (f, l) => f + ' ' + l],
            imageUrl: ['image', image => {
                return image ?
                    (image.startsWith('http') ? '' : config.backendUrl) + image:
                    config.backendUrl + '/static/img/placeholder_profile.jpg';
            }]
        }
    });

    User.resetPassword = email => (
        DSHttpAdapter.POST(`${config.apiUrl}users/reset-password/${email}/`)
    );

    return User;
}

angular
    .module('models.User', [
        'js-data',
        'config',
        'api'
    ])
    .factory('User', UserFactory)
    .run(User => User);
