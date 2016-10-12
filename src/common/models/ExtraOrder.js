function ExtraOrderFactory (DS) {
  return DS.defineResource({
    name: 'ExtraOrder',
    endpoint: 'extraOrders',
  });
}

angular
.module('models.ExtraOrder', [
  'js-data'
])
.factory('ExtraOrder', ExtraOrderFactory);
