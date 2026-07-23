import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Ricava dinamicamente l'utente decodificando il token JWT
  user = this.authService.getUserFromToken() || {
    username: 'Utente',
    email: '',
    role: 'USER'
  };

  // Stato per la gestione della sidebar
  sidebarOpen = signal<boolean>(false);
  sidebarPinned = signal<boolean>(false);

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    if (!this.sidebarPinned()) {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  toggleSidebarPin(): void {
    this.sidebarPinned.update(pinned => !pinned);
    if (this.sidebarPinned()) {
      this.sidebarOpen.set(true);
    }
  }

  closeSidebarAfterNavigation(): void {
    if (!this.sidebarPinned()) {
      this.sidebarOpen.set(false);
    }
  }

  logout(): void {
    // Sfrutta il metodo di logout del tuo AuthService che pulisce il token e reindirizza
    this.authService.logout();
  }
}