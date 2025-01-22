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
    // Skip adding header for GET requests and auth endpoints
    if (req.method === 'GET' || req.url.includes('/protocol/openid-connect/')) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.oauthService.getAccessToken()}`,
      },
    });

    return next.handle(authReq);
  }
}
