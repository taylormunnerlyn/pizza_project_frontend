function ExtraFactory (DS) {
  return DS.defineResource({
    name: 'Extra',
    endpoint: 'extras',
  });
}

angular
.module('models.Extra', [
  'js-data'
])
.factory('Extra', ExtraFactory);
