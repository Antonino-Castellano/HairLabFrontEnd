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

  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  uploadingImage = signal<boolean>(false);

  passwordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  // Converte il percorso relativo del backend in un URL assoluto con timestamp anti-cache
  private formatImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    let fullUrl = url;
    if (!url.startsWith('http') && !url.startsWith('data:')) {
      fullUrl = `http://localhost:8080${url}`;
    }
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}_t=${new Date().getTime()}`;
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getCurrentUser().subscribe({
      next: (user: User) => {
        if (user && user.profileImage) {
          user.profileImage = this.formatImageUrl(user.profileImage) || '';
        }
        this.currentUser.set(user);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(error?.error?.message || 'Impossibile caricare i dati del profilo.');
        this.loading.set(false);
      },
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onUpdateProfileImage(): void {
    if (!this.selectedFile) return;

    this.uploadingImage.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.userService.updateProfileImage(this.selectedFile).subscribe({
      next: (updatedUser: User) => {
        if (updatedUser && updatedUser.profileImage) {
          updatedUser.profileImage = this.formatImageUrl(updatedUser.profileImage) || '';
        }

        this.currentUser.set({ ...updatedUser });
        this.successMessage.set('Immagine profilo aggiornata con successo!');
        this.toastService.success('Immagine profilo aggiornata');
        this.selectedFile = null;
        this.imagePreview.set(null);
        this.uploadingImage.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set(err.error?.message || "Errore durante l'aggiornamento dell'immagine.");
        this.toastService.error("Impossibile aggiornare l'immagine");
        this.uploadingImage.set(false);
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
        this.toastService.success('Password aggiornata correttamente');
        this.passwordForm.reset();
        this.submitting.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set(err.error?.message || 'Errore durante la modifica della password.');
        this.toastService.error('Impossibile aggiornare la password');
        this.submitting.set(false);
      },
    });
  }
}