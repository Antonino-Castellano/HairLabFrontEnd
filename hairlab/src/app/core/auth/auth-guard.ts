import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = () => {
  // Recupera i servizi necessari tramite Dependency Injection.
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se il token esiste, è leggibile e non risulta scaduto,
  // permette ad Angular di aprire la route richiesta.
  if (authService.isAuthenticated()) {
    return true;
  }

  // Se l'utente non è autenticato, interrompe la navigazione
  // e lo reindirizza alla pagina di login.
  return router.createUrlTree(['/login']);
};