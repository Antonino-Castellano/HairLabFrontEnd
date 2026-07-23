import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../service/user-service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css'
})
export class ProfileFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  userForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''], 
    address: [''],
    dob: ['', Validators.required],
    role: ['USER', Validators.required]
  });

  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  
  userId = signal<number | null>(null);
  isEditMode = signal<boolean>(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId.set(+idParam);
      this.isEditMode.set(true);
      this.loadUserData(+idParam);
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUserData(id: number): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const found = users.find(u => u.id === id);
        if (found) {
          let formattedDob = '';
          if (found.dob) {
            // Estrae YYYY-MM-DD dalla data esistente
            formattedDob = new Date(found.dob).toISOString().split('T')[0];
          }

          this.userForm.patchValue({
            firstName: found.firstName,
            lastName: found.lastName,
            email: found.email,
            address: found.address,
            dob: formattedDob,
            role: found.role
          });
        } else {
          this.errorMessage.set('Utente non trovato.');
        }
      },
      error: () => this.errorMessage.set('Errore nel caricamento dati utente.')
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    // Prepariamo i dati del form
    const formValue = { ...this.userForm.value };

    // Se la password è vuota in modifica, rimuoviamola per evitare di sovrascriverla con una stringa vuota sul backend
    if (this.isEditMode() && !formValue.password) {
      delete formValue.password;
    }

    if (this.isEditMode() && this.userId() !== null) {
      this.userService.updateUser(this.userId()!, formValue).subscribe({
        next: () => {
          this.router.navigate(['/profile/all']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Errore durante l aggiornamento.');
          this.submitting.set(false);
        }
      });
    } else {
      this.userService.insertUser(formValue).subscribe({
        next: () => {
          this.router.navigate(['/profile/all']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Errore durante la creazione.');
          this.submitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/profile/all']);
  }
}