export const environment = {
  production: false,
  authConfig: {
    issuer: 'http://localhost:8081/realms/loka-realm',
    clientId: 'loka-client',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    responseType: 'code',
    scope: 'openid profile email',
    requireHttps: false, // For development only
    showDebugInformation: true,
  },
  apiUrl: 'http://localhost:8080/api',
};
