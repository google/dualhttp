(function() {
'use strict';


/**
 * A Promise-like object that you use onCacheFetched() and onServerResponded()
 * in place of then().
 */
class DualPromise {
  constructor($q) {
    this.$$cacheDeferred = $q.defer();
    this.$$serverDeferred = $q.defer();
  }

  onCacheFetched(resolveCallback) {
    this.$$cacheDeferred.promise.then(resolveCallback);
    return this;
  }

  onServerResponded(resolveCallback, opt_rejectCallback) {
    this.$$serverDeferred.promise.then(resolveCallback, opt_rejectCallback);
    return this;
  }

  finally(callback) {
    this.$$serverDeferred.promise.finally(callback);
    return this;
  }
}


/**
 * Issues http request *twice*.
 *
 * First request allows fetching from browser cache, which enables UI to
 * render sooner. Second request is meant to sent to the server only when
 * first request comes from cache. It makes sure the data is up-to-date.
 *
 * Example usage:
 *   dualHttp.get('/api/data')
 *       .onCacheFetched(onCacheSucceed)
 *       .onServerResponded(onServerSucceed, onFail);
 *   function onCacheSucceed(response) {...}
 *   function onServerSucceed(response) {...}
 *   function onFail(response) {...}
 */
class DualHttpService {
  constructor($http, $q) {
    this.http_ = $http;
    this.q_ = $q;
  }


  /**
   * Performs GET requests. It's just like AngularJS's $http.get() method,
   * except that this returns a DualPromise object, while $http.get() returns
   * a standard AngularJS Promise.
   */
  get(url, opt_config) {
    const dualPromise = new DualPromise(this.q_);
    const config = opt_config || {};
    config.headers = config.headers || {};
    config.headers['x-echo'] = Math.random() + '';

    this.http_.get(url, config).then(
        this.onFirstGet_.bind(this, dualPromise, url, config),
        this.onFirstGet_.bind(this, dualPromise, url, config));
    return dualPromise;
  }


  /**
   * Finds out whether the response's status code is between 200 and 299.
   */
  isSuccess_(resp) {
    return 200 <= resp.status && resp.status < 300;
  }


  /**
   * Detects whether a response comes from browser cache, by checking if the
   * "x-echo" header from request and from response matches.
   */
  isFromCache_(resp) {
    let fromCache = false;
    if (resp && resp.config && resp.config.headers['x-echo']) {
      const echoFromReq = resp.config.headers['x-echo'];
      const echoFromResp = resp.headers('x-echo');
      if (echoFromResp && echoFromReq != echoFromResp) {
        fromCache = true;
      }
    }
    return fromCache;
  }


  /**
   * Callback function to be called when first request is done.
   */
  onFirstGet_(dualPromise, url, config, resp) {
    if (this.isFromCache_(resp)) {
      if (this.isSuccess_(resp)) {
        dualPromise.$$cacheDeferred.resolve(resp);
      } else {
        dualPromise.$$cacheDeferred.reject(resp);
      }

      config = angular.extend({}, config);  // Make a copy.
      config.headers = angular.extend({}, config.headers);
      config.headers['x-echo'] = Math.random() + '';
      config.headers['cache-control'] = 'max-age=0';

      this.http_.get(url, config).then(
          this.onSecondGet_.bind(this, dualPromise),
          this.onSecondGet_.bind(this, dualPromise));

    } else {
      this.onSecondGet_(dualPromise, resp);
    }
  }


  /**
   * Callback function to be called when second request is done.
   */
  onSecondGet_(dualPromise, resp) {
    if (this.isSuccess_(resp)) {
      dualPromise.$$serverDeferred.resolve(resp);
    } else {
      dualPromise.$$serverDeferred.reject(resp);
    }
  }
}


angular.module('ngDualHttp', []).service('dualHttp', DualHttpService);

})();
