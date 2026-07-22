import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/auth/jwt-auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Registra la gestione globale degli errori del browser.
    provideBrowserGlobalErrorListeners(),
    // Attiva il Router utilizzando le route definite in app.routes.ts.
    provideRouter(routes),
    // Rende disponibile HttpClient in tutta l'applicazione
    // e fa passare le richieste HTTP attraverso il JWT interceptor.
    provideHttpClient(withInterceptors([jwtInterceptor]))]
};