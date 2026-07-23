import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { ChangePassword } from '../models/change-password';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  
  private readonly usersUrl = 'http://localhost:8080/hairlab/api/users';
  private readonly authUrl = 'http://localhost:8080/hairlab/api/auth';

  // Ottiene l'utente corrente basato sul token JWT (GET /hairlab/api/users)
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(this.usersUrl);
  }

  insertUser(user: User): Observable<User> {
    return this.http.post<User>(this.usersUrl, user);
  }

  changePassword(dto: ChangePassword): Observable<void> {
    return this.http.patch<void>(`${this.authUrl}/changepassword`, dto);
  }
  
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/all`);
  }
}