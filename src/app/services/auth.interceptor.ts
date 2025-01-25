// auth.interceptor.ts
import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private oauthService: OAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Define endpoints that should NOT have the Authorization header
    const excludedEndpoints = ['/api/auth/signup', '/api/auth/login'];

    // Check if the request URL matches any excluded endpoints
    const isExcluded = excludedEndpoints.some((endpoint) =>
      req.url.includes(endpoint)
    );

    // Skip adding the Authorization header for excluded endpoints, GET requests, or if no access token is present
    if (
      isExcluded ||
      req.method === 'GET' ||
      !this.oauthService.getAccessToken()
    ) {
      return next.handle(req);
    }

    // Clone the request and add the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.oauthService.getAccessToken()}`,
      },
    });

    return next.handle(authReq);
  }
}
