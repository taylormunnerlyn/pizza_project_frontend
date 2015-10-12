class Session {
    constructor ($window) {
        this.sessionStorage = $window.sessionStorage;
    }

    getItem (key) {
        return this.sessionStorage.getItem(key);
    }

    setItem (key, item) {
        return this.sessionStorage.setItem(key, item);
    }

    getObj (key, safe=true) {
        try {
            return JSON.parse(this.getItem(key));
        } catch (e) {
            if(!safe) {
                throw(e);
            }
        }
    }

    setObj (key, item) {
        return this.setItem(key, JSON.stringify(item));
    }

    getProp (key, path, defaultVal) {
        let obj = this.getObj(key);
        return _.get(obj, path, defaultVal);
    }

    setProp (key, path, val) {
        let obj = this.getObj(key) || {};
        _.set(obj, path, val);
        return this.setObj(key, obj);
    }

    removeItem (key) {
        return this.sessionStorage.removeItem(key);
    }
}

angular.module('services.session', [])
    .service('session', Session);
