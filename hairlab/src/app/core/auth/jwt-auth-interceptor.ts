import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  HAIRLAB_API_BASE_URL
} from '../config/api.config';

import {
  AuthService
} from './auth-service';

/**
 * Interceptor JWT globale.
 *
 * Responsabilità:
 *
 * - aggiunge Bearer token alle API HairLab;
 * - non aggiunge token alla richiesta di login;
 * - intercetta 401 provenienti dal backend;
 * - esegue logout quando il token non è più valido.
 *
 * L'URL base viene ora letto dalla configurazione
 * centralizzata e non duplicato nell'interceptor.
 */
export const jwtInterceptor:
  HttpInterceptorFn =
(
  request,
  next
) => {

  const authService =
    inject(AuthService);

  const token =
    authService.getToken();

  const isHairLabApi =
    request.url.startsWith(
      HAIRLAB_API_BASE_URL
    );

  const isLoginRequest =
    request.url.endsWith(
      '/auth/login'
    );

  if (
    token &&
    isHairLabApi &&
    !isLoginRequest
  ) {

    request =
      request.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`
        }
      });
  }

  return next(
    request
  ).pipe(

    catchError(
      (
        error:
          HttpErrorResponse
      ) => {

        /*
         * Un 401 sulle API protette indica
         * normalmente token mancante,
         * scaduto o non più valido.
         *
         * Non eseguiamo logout sul login stesso:
         * credenziali errate devono semplicemente
         * essere mostrate come errore di login.
         */
        if (
          error.status === 401 &&
          isHairLabApi &&
          !isLoginRequest
        ) {

          authService.logout();
        }

        return throwError(
          () => error
        );
      }
    )
  );
};
