import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { User } from '../models/user';
import { ChangePassword } from '../models/change-password';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('users');
  private readonly authUrl = hairLabApi('auth');

  // BehaviorSubject per notificare in tempo reale la topbar e i componenti dei cambi utente/immagine
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(this.apiUrl).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  insertUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      tap((updated) => this.currentUserSubject.next(updated))
    );
  }

  changePassword(dto: ChangePassword): Observable<void> {
    return this.http.patch<void>(`${this.authUrl}/changepassword`, dto);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  deleteUser(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateProfileImage(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<User>(`${this.apiUrl}/profile-image`, formData).pipe(
      tap((updatedUser) => {
        // Aggiorna subito il flusso reattivo così la topbar in alto a destra si aggiorna all'istante
        this.currentUserSubject.next(updatedUser);
      })
    );
  }
}