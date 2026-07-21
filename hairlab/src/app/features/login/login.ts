import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
import { LoginRequest } from '../../models/loginRequest';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

 submit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  const credentials: LoginRequest = this.loginForm.getRawValue();

  this.authService.login(credentials).subscribe({
    next: response => {
      console.log('Login riuscito:', response);
      this.loading = false;
      this.router.navigate(['/dashboard']);
    },
    error: error => {
      console.error('ERRORE LOGIN COMPLETO:', error);
      console.error('STATUS:', error.status);
      console.error('BODY:', error.error);

      this.loading = false;

      if (error.status === 401 || error.status === 400) {
        this.errorMessage = 'Email o password non corretti';
      } else if (error.status === 403) {
        this.errorMessage = 'Accesso bloccato da Spring Security';
      } else if (error.status === 404) {
        this.errorMessage = 'Endpoint di login non trovato';
      } else if (error.status === 0) {
        this.errorMessage = 'Impossibile comunicare con il backend';
      } else {
        this.errorMessage = 'Errore durante il login';
      }
    }
  });
}
}
