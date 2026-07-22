import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../../models/login-request';
import { LoginResponse } from '../../models/login-response';

interface JwtPayload {
  sub?: string;
  email?: string;
  username?: string;
  role?: string;
  ROLE?: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Servizi Angular recuperati tramite Dependency Injection.
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Endpoint del backend dedicato all'autenticazione.
  private readonly apiUrl = 'http://localhost:8080/hairlab/api/auth';

  // Chiave utilizzata per salvare il JWT nel localStorage.
  private readonly TOKEN_KEY = 'jwt_token';

  /**
   * Invia email e password al backend.
   * Se Spring restituisce un JWT valido, il token viene salvato
   * nel localStorage del browser.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response?.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  /**
   * Rimuove il JWT e riporta l'utente alla pagina di login.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Recupera il JWT salvato nel browser.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Controllo frontend dell'autenticazione.
   * Verifica che il token esista, sia decodificabile e non sia scaduto.
   *
   * La validazione di sicurezza effettiva rimane responsabilità
   * di Spring Security sul backend.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    const payload = this.decodeToken();

    if (!payload) {
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }

    return true;
  }

  /**
   * Verifica se il ruolo contenuto nel JWT è ADMIN.
   */
  isAdmin(): boolean {
    const role = this.getRoleFromToken();
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  }

  /**
   * Verifica se il ruolo contenuto nel JWT è USER.
   */
  isUser(): boolean {
    const role = this.getRoleFromToken();
    return role === 'USER' || role === 'ROLE_USER';
  }

  /**
   * Recupera il ruolo dal payload del JWT.
   */
  getRoleFromToken(): string | null {
    const payload = this.decodeToken();
    return payload?.ROLE || payload?.role || null;
  }

  /**
   * Richiede al backend la modifica della password
   * dell'utente attualmente autenticato.
   */
  changePassword(newPassword: string): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/changepassword`, {
      password: newPassword
    });
  }

  /**
   * Estrae dal JWT i dati utili per mostrare
   * l'utente nella dashboard.
   */
  getUserFromToken(): { username: string; email: string; role: string } | null {
    const payload = this.decodeToken();

    if (!payload) {
      return null;
    }

    const email = payload.email || payload.sub || 'N/D';
    const username = payload.username || (payload.sub ? payload.sub.split('@')[0] : 'User');

    return {
      username,
      email,
      role: payload.ROLE || payload.role || 'N/D'
    };
  }

  /**
   * Decodifica solamente il payload del JWT.
   * Non verifica la firma crittografica: quella verifica viene fatta dal backend.
   */
  private decodeToken(): JwtPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      // Un JWT è formato da HEADER.PAYLOAD.SIGNATURE.
      const payloadBase64Url = token.split('.')[1];

      if (!payloadBase64Url) {
        return null;
      }

      // Converte Base64URL nel formato Base64 standard.
      const base64 = payloadBase64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      // Aggiunge l'eventuale padding richiesto da Base64.
      const paddedBase64 = base64.padEnd(
        base64.length + (4 - base64.length % 4) % 4,
        '='
      );

      // Decodifica il payload JSON.
      const decoded = atob(paddedBase64);
      const bytes = Uint8Array.from(decoded, char => char.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);

      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
}