function SizeFactory (DS) {
  return DS.defineResource({
    name: 'Size',
    endpoint: 'sizes',
  });
}

angular
.module('models.Size', [
  'js-data'
])
.factory('Size', SizeFactory);
