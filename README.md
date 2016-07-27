# The dual-http Solution

Render your page with cached data,
then fetch up-to-date data from server and update the page.

This solution contains both frontend code and backend code.
It works in the following way:

-   The browser begins with sending an http request, allowing browser cache.
-   Either cached data or server responded data comes back.
-   A callback function gets called to allow the user (you)
    to render the webpage.
-   If the previous data came from browser cache,
    a subsequent http request that bypasses the cache is sent.
-   Another callback function is called to notify the user
    to update the content of the webpage.

It is a special header that both the http request and the response carry
that makes it possible for us to detect whether the response comes from cache,
because the backend always responses with the exact `x-echo` value
as the request has. Example:

First request:

    GET /api/data HTTP/1.1
    host: example.com
    x-echo: 456

Gets a response:

    200 OK
    x-echo: 123
    cache-control: private, max-age=31536000
    {"data": "actual data"}

Noting the difference of the `x-echo` values,
the frontend realizes that the response must be from browser cache.
It then issues a second request immediately:

    GET /api/data HTTP/1.1
    host: example.com
    x-echo: 789
    cache-control: max-age=0

Because of `max-age=0`, the browser cache gets bypassed.
The server gets the request and has to respond.

    200 OK
    x-echo: 789
    cache-control: private, max-age=31536000
    {"data": "some new data"}

This time `x-echo` values match.

## Usage

This solution supports AngularJS as frontend framework
and django as backend framework. More framework supports are on the way.

AngularJS:

    var mod = angular.module('...NAME...', ['ngDualHttp']);
    mod.controller('...NAME...', function(dualHttp) {
      dualHttp.get('/api/data')
          .onCacheFetched(onCacheSucceed)
          .onServerResponded(onServerSucceed, onFail);
      function onCacheSucceed(response) {...}
      function onServerSucceed(response) {...}
      function onFail(response) {...}
    });

django:

    # settings.py:
    MIDDLEWARE_CLASSES = (
        '...YOUR.PATH...dualhttp.backend.for_django.EchoHeaderMiddleware',
    )

Enjoy!
