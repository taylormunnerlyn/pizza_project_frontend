function ToppingFactory (DS) {
  return DS.defineResource({
    name: 'Topping',
    endpoint: 'toppings',
  });
}

angular
.module('models.Topping', [
  'js-data'
])
.factory('Topping', ToppingFactory);
