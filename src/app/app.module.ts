import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { environment } from './environment';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { ConfirmDeleteModalComponent } from './components/confirm-delete-modal/confirm-delete-modal.component';
import { ExperienceSidebarComponent } from './components/experience-sidebar/experience-sidebar.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthInterceptor } from './services/auth.interceptor';
import { SignUpDialogComponent } from './sign-up-dialog/sign-up-dialog.component';
import { ReviewFormComponent } from './components/review-form/review-form.component';
import { ReviewListComponent } from './components/review-list/review-list.component';
import { LeafletMapComponent } from './components/leaflet-map/leaflet-map.component';
import { CreateExperienceModalComponent } from './components/create-experience-modal/create-experience-modal.component';
import { EditReviewModalComponent } from './edit-review-modal/edit-review-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LeafletMapComponent,
    CreateExperienceModalComponent,
    LoginDialogComponent,
    ConfirmDeleteModalComponent,
    ExperienceSidebarComponent,
    SignUpDialogComponent,
    ReviewFormComponent,
    ReviewListComponent,
    EditReviewModalComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatSidenavModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatGridListModule,
    MatMenuModule,
    ReactiveFormsModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: [environment.apiUrl],
        sendAccessToken: true,
      },
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
