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
  role?: string | string[];
  ROLE?: string | string[];
  roles?: string | string[];
  authorities?: string | string[];
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:8080/hairlab/api/auth';
  private readonly TOKEN_KEY = 'jwt_token';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response?.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

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

  isSuperAdmin(): boolean {
    const role = this.getRoleFromToken();
    return role === 'SUPERADMIN' || role === 'ROLE_SUPERADMIN';
  }

  isAdmin(): boolean {
    const role = this.getRoleFromToken();
    return this.isSuperAdmin() || role === 'ADMIN' || role === 'ROLE_ADMIN';
  }

  isReceptionist(): boolean {
    const role = this.getRoleFromToken();
    return this.isAdmin() || role === 'RECEPTIONIST' || role === 'ROLE_RECEPTIONIST';
  }

  isCustomer(): boolean {
    const role = this.getRoleFromToken();
    return this.isReceptionist() || role === 'CUSTOMER' || role === 'ROLE_CUSTOMER' || role === 'USER' || role === 'ROLE_USER';
  }

  /**
   * Recupera il ruolo normalizzato dal payload del JWT.
   */
  getRoleFromToken(): string | null {
    const payload = this.decodeToken();
    if (!payload) return null;

    // Cerca in tutte le possibili chiavi in cui Spring potrebbe aver inserito i ruoli
    const rawRole = payload.ROLE || payload.role || payload.roles || payload.authorities;

    if (!rawRole) return null;

    // Se è un array (es. ["ROLE_RECEPTIONIST"]), prendiamo il primo o cerchiamo quello rilevante
    let roleStr = '';
    if (Array.isArray(rawRole)) {
      roleStr = rawRole.length > 0 ? String(rawRole[0]) : '';
    } else {
      roleStr = String(rawRole);
    }

    // Pulisce il prefisso ROLE_ se presente per facilitare i confronti
    return roleStr.replace('ROLE_', '').toUpperCase();
  }

  changePassword(newPassword: string): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/changepassword`, {
      password: newPassword
    });
  }

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
      role: this.getRoleFromToken() || 'N/D'
    };
  }

  private decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payloadBase64Url = token.split('.')[1];
      if (!payloadBase64Url) {
        return null;
      }

      const base64 = payloadBase64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const paddedBase64 = base64.padEnd(
        base64.length + (4 - base64.length % 4) % 4,
        '='
      );

      const decoded = atob(paddedBase64);
      const bytes = Uint8Array.from(decoded, char => char.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);

      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
}