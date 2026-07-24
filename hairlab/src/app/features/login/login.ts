import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Servizi necessari al componente.
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Stato della pagina.
  protected loading = false;
  protected errorMessage = '';
  protected showPassword = false;

  // Form reattivo con validazione di email e password.
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  /**
   * Cambia la visualizzazione della password:
   * password nascosta -> testo visibile e viceversa.
   */
  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Esegue il login quando l'utente invia il form.
   */
  protected submit(): void {
    // Blocca l'invio se il form contiene dati non validi.
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Mostra lo stato di caricamento e rimuove vecchi errori.
    this.loading = true;
    this.errorMessage = '';

    // Trasforma i valori del form nell'oggetto richiesto dal backend.
    const credentials: LoginRequest = this.loginForm.getRawValue();

    // Invia le credenziali all'AuthService.
    this.authService.login(credentials).subscribe({
      next: () => {
        // Login riuscito: termina il caricamento.
        this.loading = false;

        // Legge il ruolo dell'utente dal token per decidere dove reindirizzarlo.
        const role = this.authService.getRoleFromToken();

        if (role === 'CUSTOMER') {
          this.router.navigate(['/appointments']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: HttpErrorResponse) => {
        // Login fallito: termina il caricamento e mostra
        // un messaggio adeguato allo status HTTP.
        this.loading = false;

        if (error.status === 401 || error.status === 400) {
          this.errorMessage = 'Email o password non corretti';
        } else if (error.status === 403) {
          this.errorMessage = 'Accesso non autorizzato';
        } else if (error.status === 404) {
          this.errorMessage = 'Servizio di autenticazione non disponibile';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossibile comunicare con il server';
        } else {
          this.errorMessage = 'Errore durante il login';
        }
      }
    });
  }
}