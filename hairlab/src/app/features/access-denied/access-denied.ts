import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.css',
})
export class AccessDeniedComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected goHome(): void {
    this.router.navigate([
      this.authService.getRoleFromToken() === 'CUSTOMER' ? '/my-dashboard' : '/dashboard',
    ]);
  }
}
