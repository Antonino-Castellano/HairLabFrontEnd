import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../../models/loginRequest';
import { LoginResponse } from '../../models/loginResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
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

  isAdmin(): boolean {
    const role = this.getRoleFromToken();
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    const role = this.getRoleFromToken();
    return role === 'USER' || role === 'ROLE_USER';
  }

  getRoleFromToken(): string | null {
    const payload = this.decodeToken();
    return payload?.ROLE || payload?.role || null;
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
      role: payload.ROLE || payload.role || 'N/D'
    };
  }

  private decodeToken(): any | null {
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

      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}