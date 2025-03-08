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
        // Explicitly load the user profile to populate identity claims.
        return this.oauthService.loadUserProfile();
      })
      .then((profile: any) => {
        if (profile && profile.info && profile.info.sub) {
          localStorage.setItem('userId', profile.info.sub.toString());
        } else {
          console.warn('No sub property found in profile.');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        throw err;
      });
  }

  signUp(signUpData: SignUpRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup`, signUpData);
  }

  logout() {
    // Remove stored userId
    localStorage.removeItem('userId');
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

  // Retrieve the stored userId from localStorage
  get userId(): string | null {
    return localStorage.getItem('userId');
  }

  /**
   * Returns true if the currently logged in user is either the owner of the resource
   * (i.e. the user id matches the experience's createdBy) or if the user has the ADMIN role.
   *
   * This method reads the identity claims from the OAuth token.
   */
  isOwner(experienceCreatedBy: string): boolean {
    const profile = this.oauthService.getIdentityClaims() as any;
    if (!profile) {
      return false;
    }
    const sub: string = profile.sub;
    const roles: string[] = profile.roles || [];
    return sub === experienceCreatedBy || roles.includes('ADMIN');
  }
}
