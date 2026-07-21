import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  private authService = inject(AuthService);

  user = this.authService.getUserFromToken();

  logout(): void {
    this.authService.logout();
  }
}