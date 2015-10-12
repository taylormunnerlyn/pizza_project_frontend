import 'common/api';

function UserFactory (DS, config, $http) {
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
                }).then(this.DSRefresh.bind(this));
            },
        },
        computed: {
            fullName: ['first_name', 'last_name', (f, l) => (
                f && l ? f + ' ' + l : f || l
            )],
            imageUrl: ['image', image => {
                return image ?
                    (image.startsWith('http') ? '' : config.baseUrl) + image:
                    config.baseUrl + '/static/img/placeholder_profile.jpg';
            }]
        }
    });

    User.changePassword = function (token, pass1, pass2) {
        return $http.post(config.changePassword + token + '/', {
            password: pass1,
            verify_password: pass2
        });
    };

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
