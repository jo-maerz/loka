import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LeafletMapComponent } from './components/leaflet-map/leaflet-map.component';
import { CreateExperienceModalComponent } from './components/create-experience-modal/create-experience-modal.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

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
import { MatGridListModule } from '@angular/material/grid-list';

import { ExperiencePopupComponent } from './components/experience-popup/experience-popup.component';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from './environment';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { ConfirmDeleteModalComponent } from './confirm-delete-modal/confirm-delete-modal.component';
import { ExperienceSidebarComponent } from './experience-sidebar/experience-sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    LeafletMapComponent,
    CreateExperienceModalComponent,
    ExperiencePopupComponent,
    LoginDialogComponent,
    ConfirmDeleteModalComponent,
    ExperienceSidebarComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
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
    MatGridListModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
