class EchoHeaderMiddleware(object):

  def process_response(self, request, response):
    """Put a "x-echo" header to response with same value from request."""
    echo = request.META.get('HTTP_X_ECHO', '')
    if echo:
      response['x-echo'] = echo
    return response
