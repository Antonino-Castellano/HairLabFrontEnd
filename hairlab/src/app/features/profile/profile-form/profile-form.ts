import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../models/user';
import { UserService } from '../../../service/user-service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css'
})
export class ProfileFormComponent {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  userForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    address: [''],
    role: ['USER', Validators.required]
  });

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const newUser: User = this.userForm.value;

    this.userService.insertUser(newUser).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || 'Errore durante la creazione dell\'utente.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }
}