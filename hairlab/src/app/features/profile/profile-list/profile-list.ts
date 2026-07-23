import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user';
import { UserService } from '../../../service/user-service';

@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-list.html',
  styleUrl: './profile-list.css'
})
export class ProfileListComponent implements OnInit {
  private readonly userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    // Assicurati che nel UserService esista un metodo per ottenere tutti gli utenti (es. getAllUsers o simile)
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare la lista degli utenti.');
        this.loading.set(false);
      }
    });
  }
}