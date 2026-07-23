import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../service/user-service';
import { User } from '../../../models/user';


@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-list.html',
  styleUrl: './profile-list.css'
})
export class ProfileListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  users = signal<User[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Errore durante il caricamento degli utenti.');
        this.loading.set(false);
      }
    });
  }

  onEdit(user: User): void {
    // Reindirizza al form di modifica passando l'id (es. /profile/edit/5 o gestendolo via rotta)
    this.router.navigate(['/profile/edit', user.id]);
  }

  onDelete(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          // Rimuove l'utente dalla lista locale senza dover ricaricare tutto
          this.users.update(list => list.filter(u => u.id !== id));
        },
        error: (err) => {
          this.errorMessage.set('Errore durante l eliminazione dell utente.');
        }
      });
    }
  }
}