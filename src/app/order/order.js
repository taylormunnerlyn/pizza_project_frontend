import 'common/models/Pizza';

class OrderController {
  constructor (Notify, user, Order, ExtraOrder, Pizza) {
    this.user = user;
    Order.findAllPaged()
      .then(orders => {
        this.orders = orders;
        this.orderTimes = [];
        orders.forEach((order) => {
          Pizza.findAllPaged({order:order.id}).then(pizzas => {
              console.log(pizzas);
            })
          this.orderTimes.unshift(moment(order.time_ordered).fromNow());
        });
      })
  }
}

function config ($stateProvider) {
  $stateProvider.state('pizza_frontend.order', {
    url: '/order',
    controller: 'OrderController',
    controllerAs: '$ctrl',
    templateUrl: 'app/order/order.tpl.html',
    resolve: {
      $title: () => 'Order',
      loggedIn: auth => auth.requireLoggedIn(),
      user: (loggedIn, auth) => auth.resolveUser()
    }
  });
}

angular
.module('pizza_frontend.order', [
  'ui.router',
])
.config(config)
.controller('OrderController', OrderController);
