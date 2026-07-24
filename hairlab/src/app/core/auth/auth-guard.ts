import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Controllo autenticazione
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Recupero il ruolo (può essere stringa o null)
  const role = authService.getRoleFromToken();

  // 3. Se il ruolo è null, blocchiamo subito l'accesso
  if (!role) {
    router.navigate(['/access-denied']);
    return false;
  }

  // 4. Leggo i ruoli consentiti dalla rotta
  const allowedRoles = route.data['roles'] as string[];

  // 5. Verifico se il ruolo è incluso tra quelli consentiti
  if (allowedRoles && allowedRoles.includes(role)) {
    return true;
  }

  // Altrimenti accesso negato
  router.navigate(['/access-denied']);
  return false;
};