var pagingCache = {};

var defaults = {
    cacheResponse: true,
    pageQueryParam: 'page',
    fetchAll: false,
    prefetch: 1,
//    pageSize: 20,
//    pageSizeQueryParam: 'page_size',
};

export class Paging {
    constructor ($q, $http, options, resource) {
        this.$q = $q;
        this.$http = $http;
        this.url = options.url;

        this.options = _.defaults(options, resource, defaults);
        this.resource = resource;

        this.meta = {
            currentPage: 0,
            fetchingPage: 0,
            pageCount: 0,
            pageSize: 0,
            totalCount: 0
        };
        this.fetching = null;
        this.emptyPage = [];
        this.all = [];

        let cacheStr = this.url + JSON.stringify(options.params);
        if (cacheStr in pagingCache) {
            let cached = pagingCache[cacheStr];
            this.pages = cached.pages;
            this.pageRequests = cached.pageRequests;
        } else {
            this.pages = {};
            this.pageRequests = {};
            pagingCache[cacheStr] = {
                pages: this.pages,
                pageRequests: this.pageRequests
            };
        }
    }

    init (data) {
        let firstPage = this.$q.resolve(data);
        if (!data) {
            firstPage = this.$http.get(this.url, this.options);
        }
        let initialized = firstPage.then(response => {
            let content = 'data' in response ? response.data : response;
            this.meta.totalCount = content.count;
            this.meta.pageSize = content.results.length;
            this.meta.pageCount = content.results.length ? Math.ceil(
                this.meta.totalCount / this.meta.pageSize
            ) : 1;
            this.savePage(1, firstPage);
            return this.loadPage(1, this.options.prefetch);
        });
        if (this.options.fetchAll) {
            return initialized.then(() => {
                return this.fetchAll(this.options.fetchAll === 'parallel');
            });
        }
        return initialized;
    }

    getResult (data) {
        let results = 'data' in data ? data.data.results : data.results || data;
        if (this.options.deserialize) {
            return this.options.deserialize(this.resource, results);
        }
        if (this.options.cacheResponse) {
            return this.resource.inject(results);
        }
        return this.resource.createCollection(results);
    }

    _updateAll () {
        this.all = [];
        _.sortBy(_.pairs(this.pages), '0').forEach(pair => {
            Array.prototype.push.apply(this.all, pair[1]);
        });
    }

    savePage (page, promise) {
        this.pageRequests[page] = promise.then(data => {
            let result = this.getResult(data);
            result.page = page;
            this.pages[page] = result;
            this._updateAll();
            return result;
        }, err => {
            this.pageRequests[page] = null;
            throw err;
        });
        return this.pageRequests[page];
    }

    fetchPage (page) {
        if (this.pageRequests[page]) {
            return this.pageRequests[page];
        }

        let options = _.clone(this.options, true);
        options.params[options.pageQueryParam] = page;
        if (options.pageSize) {
            options.params[options.pageSizeQueryParam] = options.pageSize;
        }

        return this.savePage(page, this.$http.get(this.url, options));
    }

    fetchAll (parallel) {
        if (parallel) {
            let promises = [];
            for (var i = 1; i <= this.meta.pageCount; i++) {
                promises.push(this.fetchPage(i));
            }
            return this.$q.all(promises).then(() => this.all);
        }

        let results = [];
        let aborted = false;
        let serialFetchAll = page => {
            if (page > this.meta.pageCount || aborted) {
                return results;
            }
            return this.fetchPage(page).then(result => {
                results.push.apply(results, result);
                return serialFetchAll(page + 1);
            });
        };
        let promise = serialFetchAll(1);
        promise.results = results;
        promise.abort = () => {
            aborted = true;
        };
        return promise;
    }

    loadPage (page, prefetch) {
        page = page < 1 ? 1 : (
            page <= this.meta.pageCount ? page : this.meta.pageCount
        );
        this.fetching = this.fetchPage(page).then(result => {
            this.fetching = null;
            this.meta.currentPage = page;
            this.meta.fetchingPage = null;

            if (prefetch) {
                for (var i = 1; i <= prefetch; i++) {
                    let forward = page + i;
                    if (forward <= this.meta.pageCount) {
                        this.fetchPage(forward);
                    }
                    let backward = page - i;
                    if (backward >= 1) {
                        this.fetchPage(backward);
                    }
                }
            }

            return result;
        });
        this.meta.fetchingPage = page;

        return this.fetching;
    }

    next () {
        return this.loadPage(this.meta.currentPage + 1, this.options.prefetch);
    }

    prev () {
        return this.loadPage(this.meta.currentPage - 1, this.options.prefetch);
    }

    get allLoaded () {
        return this.all.length === this.meta.totalCount;
    }

    get page () {
        return this.pages[this.meta.currentPage] || this.emptyPage;
    }

    get start () {
        return this.meta.currentPage === 1;
    }

    get end () {
        return this.meta.currentPage === this.meta.pageCount;
    }
}
