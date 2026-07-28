import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

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
export class LayoutComponent implements OnInit, OnDestroy {
  public readonly router = inject(Router);
  public readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  private routerSub?: Subscription;
  private userSub?: Subscription;

  user = signal<any>({
    username: 'Utente',
    email: '',
    role: 'USER',
    profileImage: null,
  });

  ngOnInit(): void {
    // 1. Carica subito i dati dal token locale (evita qualsiasi errore 401 all'avvio)
    this.loadUserDataFromToken();

    // 2. Ascolta in tempo reale i cambi utente/immagine provenienti dal UserService (es. quando aggiorni il profilo)
    this.userSub = this.userService.currentUser$.subscribe((updatedUser) => {
      if (updatedUser) {
        this.updateUserState(updatedUser);
      }
    });

    // 3. Aggiorna lo stato ad ogni navigazione se necessario
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUserDataFromToken();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  // Corretto per gestire sia gli assets locali del frontend che i file salvati nel backend
  private formatImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    let fullUrl = url;

    if (url.startsWith('/assets/')) {
      fullUrl = url;
    } else if (!url.startsWith('http') && !url.startsWith('data:')) {
      fullUrl = `http://localhost:8080${url}`;
    }

    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}_t=${new Date().getTime()}`;
  }

  private updateUserState(userData: any): void {
    let imageUrl = userData.profileImage;
    if (imageUrl) {
      imageUrl = this.formatImageUrl(imageUrl);
    }

    this.user.set({
      username: userData.username || userData.firstName || 'Utente',
      email: userData.email || '',
      role: userData.role || this.authService.getRoleFromToken() || 'USER',
      profileImage: imageUrl,
    });
  }

  loadUserDataFromToken(): void {
    const tokenUser = this.authService.getUserFromToken();
    if (tokenUser) {
      this.updateUserState(tokenUser);
    }
  }

  sidebarOpen = signal<boolean>(false);
  sidebarPinned = signal<boolean>(false);

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