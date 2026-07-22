import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Recupera il JWT salvato dopo il login.
  const token = authService.getToken();

  // Controlla che la richiesta sia diretta al backend HairLab.
  const isHairLabApi = req.url.startsWith('http://localhost:8080/hairlab/api');

  // La richiesta di login non deve contenere un vecchio JWT.
  const isLoginRequest = req.url.endsWith('/auth/login');

  // Se esiste un token e la richiesta è verso un endpoint protetto,
  // clona la richiesta e aggiunge l'header Authorization.
  if (token && isHairLabApi && !isLoginRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Continua la catena degli interceptor e invia la richiesta.
  return next(req);
};