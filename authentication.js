const { API_BASE_URL, APP_BASE_URL } = require('./constants');

const SCOPES = [
  'workspace:read',
  'channels:read',
  'posts:read',
  'posts:write',
  'posts:publish',
  'media:read',
  'media:write',
  'analytics:read',
  'webhooks:manage',
].join(' ');

// Exchange the authorization code (+ PKCE code_verifier) for tokens.
// Nimply is a public OAuth client — there is no client secret.
const getAccessToken = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/oauth/token`,
    headers: { 'Content-Type': 'application/json' },
    body: {
      grant_type: 'authorization_code',
      code: bundle.inputData.code,
      // Provided by Zapier when enablePkce is true.
      code_verifier: bundle.inputData.code_verifier,
      client_id: process.env.CLIENT_ID,
      redirect_uri: bundle.inputData.redirect_uri,
    },
  });

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
};

const refreshAccessToken = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/oauth/token`,
    headers: { 'Content-Type': 'application/json' },
    body: {
      grant_type: 'refresh_token',
      refresh_token: bundle.authData.refresh_token,
      client_id: process.env.CLIENT_ID,
    },
  });

  return {
    access_token: response.data.access_token,
    // Fall back to the existing refresh token if the server does not rotate it.
    refresh_token: response.data.refresh_token || bundle.authData.refresh_token,
  };
};

// Connectivity check; its response also powers the connection label ({{name}}).
const test = async (z, bundle) => {
  const response = await z.request({ url: `${API_BASE_URL}/v1/workspace` });
  return response.data;
};

module.exports = {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl: {
      url: `${APP_BASE_URL}/oauth/authorize`,
      params: {
        client_id: '{{process.env.CLIENT_ID}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        scope: '{{bundle.inputData.scope}}',
        state: '{{bundle.inputData.state}}',
        response_type: 'code',
        // code_challenge and code_challenge_method (S256) are appended
        // automatically by Zapier because enablePkce is true.
      },
    },
    getAccessToken,
    refreshAccessToken,
    scope: SCOPES,
    autoRefresh: true,
    enablePkce: true,
  },
  test,
  connectionLabel: '{{name}}',
};
