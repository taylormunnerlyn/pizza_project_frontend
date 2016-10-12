class HomeController {
  constructor (Notify, user) {
    this.user = user;
    Notify.info('Hello World!');
  }
}

function config ($stateProvider) {
  $stateProvider.state('pizza_frontend.home', {
    url: '/',
    controller: 'HomeController',
    controllerAs: 'homeCtrl',
    templateUrl: 'app/home/home.tpl.html',
    resolve: {
      $title: () => 'Home',
      loggedIn: auth => auth.requireLoggedIn(),
      user: (loggedIn, auth) => auth.resolveUser()
    }
  });
}

angular
.module('pizza_frontend.home', [
  'ui.router',
])
.config(config)
.controller('HomeController', HomeController);
