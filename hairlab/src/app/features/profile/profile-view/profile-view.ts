import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../models/user';
import { UserService } from '../../../service/user-service';
import { ChangePassword } from '../../../models/change-password';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.css'
})
export class ProfileViewComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  currentUser = signal<User | null>(null);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  passwordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]]
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
      error: () => {
        this.errorMessage.set('Impossibile caricare i dati del profilo.');
        this.loading.set(false);
      }
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
        this.passwordForm.reset();
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Errore durante la modifica della password.');
        this.submitting.set(false);
      }
    });
  }
}