import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../models/user';
import { UserService } from '../../../service/user-service';
import { ChangePassword } from '../../../models/change-password';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth-service';
import { ToastService } from '../../../shared/ui/toast.service';
import { HairLabTechnicalLabelPipe } from '../../../shared/ui/hairlab-technical-label.pipe';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HairLabTechnicalLabelPipe],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.css',
})
export class ProfileViewComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected readonly isCustomer = this.authService.getRoleFromToken() === 'CUSTOMER';

  currentUser = signal<User | null>(null);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  passwordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Impossibile caricare i dati del profilo.');
        this.loading.set(false);
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const dto: ChangePassword = this.passwordForm.value;

    this.userService.changePassword(dto).subscribe({
      next: () => {
        this.successMessage.set('Password modificata con successo!');
        this.toastService.success('Password aggiornata correttamente');
        this.passwordForm.reset();
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Errore durante la modifica della password.');
        this.toastService.error('Impossibile aggiornare la password');
        this.submitting.set(false);
      },
    });
  }
}
