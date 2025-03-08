import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { SignUpDialogComponent } from '../../sign-up-dialog/sign-up-dialog.component';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  login() {
    this.errorMessage = '';

    if (!this.email || !this.password) return;
    this.authService
      .login(this.email, this.password)
      .then(() => this.dialogRef.close())
      .catch((error) => {
        console.error('Login failed:', error);
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage =
            'An unexpected error occurred. Please try again later.';
        }
      });
  }

  openSignUp(event: Event) {
    event.preventDefault();
    this.dialogRef.close();
    this.dialog.open(SignUpDialogComponent);
  }
}
