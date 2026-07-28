import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth-service';
import { UserService } from '../../service/user-service';
import { HairLabTechnicalLabelPipe } from '../ui/hairlab-technical-label.pipe';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HairLabTechnicalLabelPipe],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent implements OnInit {
  public readonly router = inject(Router);
  public readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  /**
   * Utente ricavato dal JWT.
   * Manteniamo un fallback per evitare errori nel template
   * durante logout/scadenza token.
   */
  user = this.authService.getUserFromToken() || {
    username: 'Utente',
    email: '',
    role: 'USER',
    profileImage: null,
  };

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (currentUser) => {
        const fullName = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim();
        this.user = {
          username: fullName || currentUser.email?.split('@')[0] || 'Utente',
          email: currentUser.email || this.user.email,
          role: String(currentUser.role || this.user.role),
          profileImage: currentUser.profileImage || this.user.profileImage,
        };
      },
      error: () => {
        // Il layout conserva i dati già disponibili nel JWT.
      },
    });
  }

  sidebarOpen = signal<boolean>(false);
  sidebarPinned = signal<boolean>(false);

  /**
   * Le funzioni operative di scorte/acquisti conservano le route
   * /color-lab/... per compatibilità, ma sono visualizzate in una
   * sezione autonoma della sidebar.
   */
  private readonly stockManagementRoutes = [
    '/color-lab/movements',
    '/color-lab/reorder',
    '/color-lab/orders',
    '/color-lab/suppliers',
  ];

  colorLabMenuOpen = signal<boolean>(
    this.router.url.startsWith('/color-lab') && !this.isStockManagementRoute(this.router.url),
  );

  stockMenuOpen = signal<boolean>(this.isStockManagementRoute(this.router.url));

  /**
   * Helper centralizzato per la visibilità delle voci di menu.
   * Evita di ripetere direttamente la logica JWT nel template.
   */
  hasAnyRole(roles: string[]): boolean {
    const role = this.authService.getRoleFromToken();
    return role != null && roles.includes(role);
  }

  getHomeRoute(): string {
    return this.authService.getRoleFromToken() === 'CUSTOMER' ? '/my-dashboard' : '/dashboard';
  }

  getProfileRoute(): string {
    return this.authService.getRoleFromToken() === 'CUSTOMER' ? '/my-account' : '/profile';
  }

  toggleColorLabMenu(): void {
    this.colorLabMenuOpen.update((open) => !open);
  }

  toggleStockMenu(): void {
    this.stockMenuOpen.update((open) => !open);
  }

  private isStockManagementRoute(url: string): boolean {
    return this.stockManagementRoutes.some((route) => url.startsWith(route));
  }

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    if (!this.sidebarPinned()) {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  toggleSidebarPin(): void {
    this.sidebarPinned.update((pinned) => !pinned);

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
    this.authService.logout();
  }
}
