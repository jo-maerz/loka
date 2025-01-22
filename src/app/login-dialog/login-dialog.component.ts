import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent {
  email: string = '';
  password: string = '';

  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private authService: AuthService
  ) {}

  login() {
    if (!this.email || !this.password) return;
    this.authService
      .login(this.email, this.password)
      .then(() => this.dialogRef.close())
      .catch((error) => {
        console.error('Login failed:', error);
      });
  }
}
