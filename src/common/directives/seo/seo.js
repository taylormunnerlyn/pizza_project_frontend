/**
 * @ngdoc directive
 * @name izSeo
 * @description
 * This directive is meant to dynamically update and generate Open Graph meta
 * data inside the head element. It is meant to used in conjunction with uiRouter.
 *
 * For this directive to be used each desired uiState needs to have on object called data
 * that contains an 'seo' object. The seo object can contain title, description, image,
 * and type.  The OG url property will be constructed at state change.
 *
 * The directive will recurively construct the title base on the current title
 * concated with it's ancestors title. Same as description.  The image will be populated
 * with the first image that is found in the chain, as well as type.
 *
 * If you do not desire to recurively construct the title or description pass the
 * stop flag inside of the seo object. This will stop the recurision.
 *
 * @example use <head iz-seo></head>
 * @example use state
 *  $stateProvider.state('vader', {
 *   url: '/',
 *   template: 'Luke... I am your father',
 *   data: {
 *      seo: {
 *      title: 'home',
 *      description: 'The power of the Dark Side!',
 *      image: 'http://i.imgur.com/HVgT5cc.jpg',
 *      type: 'blog'
 *     }
 *   }
 * })
 * .state('vader.luke', {
 *   url: 'kissed-my-sister',
 *   data: {
 *     seo: { // image and type will be inherited from 'vader' state.
 *      title: 'luke'  // at run time this title will be 'luke | home',
 *      description: 'I didn\'t know!', // 'I didn\'t know! The power of the Dark Side'
 *     }
 *   }
 * })
 * .state ('vader.chewbacca', {
 * // this state will not inherit anything from it's parent state.
 *    data: {
 *      seo: {
 *        title: 'RAWRGWAWGGR',
          description: 'RAWRGWAWGGR RRRAARRWHHGWWR',
          stop: true,
          image: 'http://i.imgur.com/FrKRP90.jpg'
 *      }
 *    }
 *})
 */

function izSeo ($state, $location) {
  return {
    restrict: 'A',
    link: function Seo (scope, elem) {
      const META_KEYS = ['title', 'type', 'url', 'image', 'description'];

      scope.$on('$stateChangeSuccess', () => {
        let metas = [].slice.call(elem.find('meta'));
        // Clear previous meta tags
        metas.filter(m => {
          let prop = m.attributes.getNamedItem('property');
          return prop && /^og/.test(prop.nodeValue);
        }).forEach(node => node.remove());

        // Create meta tags add them to the head.
        let metObj = createOGData($state.$current);
        metObj.url = `${location.protocol}//${location.host}${$location.url()}`;
        elem.append(createMetaTags(metObj));
      });

      function createOGData (state) {
        if (!state) {
          return;
        }

        // Because uiRouter copies attributes from parent into child we have to
        // check if the seo obj is coming parent or current state.
        let newHas = _.has.bind(null, state);
        let hasSeo = newHas('data.seo');
        // Thanks _!
        if (!hasSeo || (hasSeo && newHas('parent.parent.data') &&
          _.isEqual(state.data.seo, state.parent.data.seo))) {
          return createOGData(state.parent);
        }

        let recursiveData = createOGData(state.parent);
        if (recursiveData && !state.data.seo.stop) {
          let partial = getValue.bind(null, state.data.seo, state.parent.data.seo);
          let obj = {
            title: partial('title', ' | '),
            description: partial('description'),
            image: state.data.seo.image || recursiveData.image,
            type: state.data.seo.type || recursiveData.type
          };
          return obj;
        } else {
          return state.data.seo;
        }
      }

      function getValue (state, parent, key, joinBy=' ') {
        if (state[key] && parent && parent[key]) {
          return [state[key], parent[key]].join(joinBy);
        }
        return state[key] || parent[key] || '';
      }

      function createMetaTags (obj) {
        return META_KEYS.filter(k => obj[k]).map(key => {
          return `<meta property="og:${key}"
                        content="${obj[key]}"
                        class="og-meta"/>`;
        }).join('\n');
      }
    }
  };
}

angular.module('directives.seo', ['ui.router'])
  .directive('izSeo', izSeo);
