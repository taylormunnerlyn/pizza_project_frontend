function CrustFactory (DS) {
  return DS.defineResource({
    name: 'Crust',
    endpoint: 'crusts',
  });
}

angular
.module('models.Crust', [
  'js-data'
])
.factory('Crust', CrustFactory);
