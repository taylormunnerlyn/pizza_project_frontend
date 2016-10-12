import './User';

function PizzaFactory (DS, Order) {
  return DS.defineResource({
    name: 'Pizza',
    endpoint: 'pizzas',
    relations: {
      hasOne: {
        Order: {
          localField: 'orderObj',
          localKey: 'order'
        }
      }
    }
  });
}

angular
.module('models.Pizza', [
  'js-data'
])
.factory('Pizza', PizzaFactory);
