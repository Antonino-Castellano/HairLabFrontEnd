import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  private readonly router = inject(Router);

  // Proprietà utente necessaria per l'HTML
  user = {
    username: 'salvio',
    role: 'ADMIN'
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
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}