import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService, SignUpRequest } from '../services/auth.service';

@Component({
  selector: 'app-sign-up-dialog',
  templateUrl: './sign-up-dialog.component.html',
  styleUrls: ['./sign-up-dialog.component.scss'],
})
export class SignUpDialogComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private dialogRef: MatDialogRef<SignUpDialogComponent>,
    private authService: AuthService
  ) {}

  signUp() {
    if (!this.email || !this.password || !this.firstName || !this.lastName) {
      // Optionally, show validation errors to the user.
      return;
    }

    const signUpData: SignUpRequest = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
    };

    this.authService.signUp(signUpData).subscribe({
      next: () => {
        // Automatically log the user in after a successful sign-up.
        this.authService
          .login(this.email, this.password)
          .then(() => {
            this.dialogRef.close();
          })
          .catch((error) => {
            console.error('Auto login failed:', error);
            // Optionally, display an error message to the user.
          });
      },
      error: (error) => {
        console.error('Sign Up failed:', error);
        // Optionally, display an error message to the user.
      },
    });
  }
}
