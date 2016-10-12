function OrderFactory (DS) {
  return DS.defineResource({
    name: 'Order',
    endpoint: 'orders'
  });
}

angular
.module('models.Order', [
  'js-data'
])
.factory('Order', OrderFactory);
        
