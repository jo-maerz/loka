// auth.service.ts
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private oauthService: OAuthService, private http: HttpClient) {
    this.configure();
  }

  private configure() {
    this.oauthService.configure(environment.authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.oauthService.setupAutomaticSilentRefresh();
  }

  login(email: string, password: string): Promise<void> {
    return this.oauthService
      .fetchTokenUsingPasswordFlow(email, password)
      .then(() => {
        // todo post-login logic
      })
      .catch((err) => {
        console.error('Login error:', err);
        throw err;
      });
  }

  signUp(signUpData: SignUpRequest): Observable<any> {
    // No need to attach Authorization headers; handled by interceptor
    return this.http.post(`${environment.apiUrl}/auth/signup`, signUpData);
  }

  logout() {
    const idToken = this.oauthService.getIdToken();
    this.oauthService.logOut({
      client_id: environment.authConfig.clientId,
      post_logout_redirect_uri: environment.authConfig.redirectUri,
      id_token_hint: idToken,
    });
  }

  get accessToken() {
    return this.oauthService.getAccessToken();
  }

  get isLoggedIn() {
    return this.oauthService.hasValidAccessToken();
  }

  get userProfile() {
    return this.oauthService.getIdentityClaims();
  }
}
