import {
  Component,
  HostListener,
  inject,
  signal
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  /**
   * Service utilizzato per recuperare
   * l'utente autenticato e gestire il logout.
   */
  private readonly authService =
    inject(AuthService);

  /**
   * Informazioni dell'utente recuperate dal JWT.
   */
  protected readonly user =
    this.authService.getUserFromToken();

  /**
   * Indica se la sidebar è attualmente visibile.
   *
   * Di default parte chiusa.
   */
  protected readonly sidebarOpen =
    signal(false);

  /**
   * Indica se l'utente ha scelto
   * di bloccare la sidebar aperta.
   */
  protected readonly sidebarPinned =
    signal(false);

  /**
   * Apre la sidebar.
   *
   * Viene utilizzato quando il mouse entra
   * nella zona sensibile sul bordo sinistro.
   */
  protected openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  /**
   * Chiude la sidebar solamente se
   * non è stata bloccata aperta.
   */
  protected closeSidebar(): void {
    if (!this.sidebarPinned()) {
      this.sidebarOpen.set(false);
    }
  }

  /**
   * Apre o chiude manualmente la sidebar
   * tramite il pulsante del menu.
   */
  protected toggleSidebar(): void {
    this.sidebarOpen.update(
      value => !value
    );
  }

  /**
   * Blocca o sblocca la sidebar.
   *
   * Quando viene bloccata,
   * rimane sempre aperta.
   */
  protected toggleSidebarPin(): void {
    this.sidebarPinned.update(
      value => !value
    );

    if (this.sidebarPinned()) {
      this.sidebarOpen.set(true);
    }
  }

  /**
   * Su schermi piccoli chiude la sidebar
   * dopo aver selezionato una voce.
   */
  protected closeSidebarAfterNavigation(): void {
    if (
      window.innerWidth <= 900
    ) {
      this.sidebarPinned.set(false);
      this.sidebarOpen.set(false);
    }
  }

  /**
   * Permette di chiudere la sidebar
   * premendo il tasto ESC.
   */
  @HostListener(
    'document:keydown.escape'
  )
  protected handleEscape(): void {
    if (!this.sidebarPinned()) {
      this.sidebarOpen.set(false);
    }
  }

  /**
   * Effettua il logout.
   */
  protected logout(): void {
    this.authService.logout();
  }
}