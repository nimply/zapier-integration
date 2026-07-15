// Add the OAuth bearer token to every outgoing API request.
const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData && bundle.authData.access_token && !request.headers.Authorization) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }
  return request;
};

module.exports = {
  befores: [includeBearerToken],
  afters: [],
};
